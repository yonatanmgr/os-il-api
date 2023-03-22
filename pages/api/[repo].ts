// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  let headersList = {
    Accept: "*/*",
    Authorization: "bearer " + process.env.github_read_token,
    "Content-Type": "application/json",
  };

  let gqlBody = {
    query: `query ($repoOwner: String!, $repoName: String!) {
     repository(owner: $repoOwner, name: $repoName) {
       languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
         edges {
           size
           node {
             name
           }
         }
       },
       openGraphImageUrl,
       shortDescriptionHTML,
       pushedAt,
       upCase: object(expression: "master:README.md") {
         ... on Blob {
           text
         }
       }
     }
   }`,
    variables: { repoOwner: request.query.repo.split(".")[0], repoName: request.query.repo.split(".")[1] },
  };

  let bodyContent = JSON.stringify(gqlBody);

  fetch("https://api.github.com/graphql", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  })
    .then((res) => res.text())
    .then((text) => {
      const t = JSON.parse(text);
      response.status(200).json(t);
    });
}
