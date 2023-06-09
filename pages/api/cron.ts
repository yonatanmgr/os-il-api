import axios from "axios";
import { ObjectId } from "mongodb";

export default function handler(req, res) {
  const langsToListRegex = /^\s?#{3}([^#{3}]+?)\n([^]+?)(?=^\s?#{3}[^#{3}])/gm;
  const splitProjectRegex = /\[(.+)\]\((https:\/\/github\.com\/[\w\/-]+)\) ?-? ?([^\![]+)/;
  const splitCompanyRegex = /\[(.+)\]\((.+)\)/;
  const findListItemRegex = /(?<=\* ).*/gm;
  const isRepoRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/].+\/?$/;
  const projectsTitleRegex =
    /(?:^|\n)## Projects by main language\s?[^\n]*\n(.*?)(?=\n##?\s|$)/gs;
  const compsTitleRegex = /(?:^|\n)## Companies\s?[^\n]*\n(.*?)(?=\n##?\s|$)/gs;
  const readmeUrl =
    "https://raw.githubusercontent.com/lirantal/awesome-opensource-israel/master/README.md";

  const { MongoClient, ServerApiVersion } = require("mongodb");
  const uri = process.env.MONGODB_URI;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  const headersList = {
    Accept: "*/*",
    Authorization: "bearer " + process.env.github_read_only,
    "Content-Type": "application/json",
  };

  const saveToDB = async (col, data, id) => {
    try {
      // Connect the client to the server (optional starting in v4.7)
      await client.connect();
      const collection = await client.db("osil").collection(col);
      collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { data: data } },
        { upsert: true }
      );
    } finally {
      // Ensures that the client will close when you finish/error
      await setTimeout(() => {
        client.close();
      }, 1500);
    }
  };

  axios.get(readmeUrl).then((result) => {
    let allProjects: any[] = [];
    let allComps: any[] = [];

    const compsStr = (result.data.match(compsTitleRegex) as string[])[0];
    const langsStr = (result.data.match(projectsTitleRegex) as string[])[0];

    const compsList = compsStr.match(findListItemRegex);
    const allLanguages = langsStr.match(langsToListRegex);

    compsList?.forEach((company) => {
      allComps.push(company.match(splitCompanyRegex));
    });

    allLanguages?.forEach((lang) => {
      allProjects.push(lang.match(findListItemRegex));
    });

    allComps = allComps
      .map((company) => {
        if (company[2].split("/").includes("github.com")) {
          return { name: company[2].replace("https://github.com/", "") };
        }
      })
      .filter((comp) => comp != undefined);

    allProjects = allProjects
      .flat()
      .map((projectStr) => {
        const res = projectStr.match(splitProjectRegex);

        if (res) {
          if (isRepoRegex.test(res[2])) {
            const owner = res[2].split("/")[3];
            const name = res[2].split("/")[4];
            
            return {
              name: `${owner}/${name}`,
              description: res[3],
            };
          } else {
            allComps.push({ name: res[2].split("/")[3] });
          }
        }
      })
      .filter((project) => project != undefined);

    const fetchProjects = () => {
      const requests: any[] = [];
      const results: any[] = [];

      allProjects.forEach((project) => {
        let gqlBody = {
          query: `query ($repoOwner: String!, $repoName: String!) {
            repository(owner: $repoOwner, name: $repoName) {
              openIssues: issues(states:OPEN) {
                totalCount
              }
              stargazerCount
              nameWithOwner
              languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                totalSize
                edges {
                  size
                  node {
                    name
                  }
                }
              }
              openGraphImageUrl
              description
              defaultBranchRef {
                target {
                  ... on Commit {
                    committedDate
                  }
                }
              }
            }
          }
          `,
          variables: {
            repoOwner: project.name.split("/")[0],
            repoName: project.name.split("/")[1],
          },
        };

        let bodyContent = JSON.stringify(gqlBody);

        const promise = fetch("https://api.github.com/graphql", {
          method: "POST",
          mode: "cors",
          headers: headersList,
          body: bodyContent,
        }).then((res) => res.json());
        requests.push(promise);
      });
      return new Promise((resolve) => {
        Promise.all(requests)
          .then((proms) => proms.forEach((p) => results.push(p.data)))
          .then(() => resolve(results));
      });
    };

    const fetchComps = () => {
      const requests: any[] = [];
      const results: any[] = [];

      allComps.forEach((company) => {
        let gqlBody = {
          query: `query ($login: String!) {
            organization(login: $login) {
              name
              avatarUrl
              login
              repositories(
                first: 100
                isLocked: false
                isFork: false
                privacy: PUBLIC
                orderBy: {direction: DESC, field: STARGAZERS}
              ) {
                nodes {
                  openIssues: issues(states:OPEN) {
                    totalCount
                  }
                  stargazerCount
                  nameWithOwner
                  languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
                    totalSize
                    edges {
                      size
                      node {
                        name
                      }
                    }
                  }
                  openGraphImageUrl
                  description
                  defaultBranchRef {
                    target {
                      ... on Commit {
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }`,
          variables: { login: company.name },
        };

        let bodyContent = JSON.stringify(gqlBody);

        const promise = fetch("https://api.github.com/graphql", {
          method: "POST",
          mode: "cors",
          headers: headersList,
          body: bodyContent,
        }).then((res) => res.json());
        requests.push(promise);
      });
      return new Promise((resolve) => {
        Promise.all(requests)
          .then((proms) => proms.forEach((p) => results.push(p.data)))
          .then(() => resolve(results));
      });
    };

    fetchProjects().then((result) =>
      saveToDB("repos", result, "641b1b262b3ed03c46995e60")
    );
    fetchComps().then((result) =>
      saveToDB("comps", result, "641b2aaf8cf478f1b611c04e")
    );
    if (req.query.key == process.env.update_password) {
      return res.status(200).json({});
    } else {
      res.status(404).end();
      return;
    }
  });
}
