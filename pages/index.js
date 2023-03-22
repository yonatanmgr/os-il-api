import React, {useEffect, useState} from "react";


export default function Home() {
  const [data, setData] = useState("")
  
  useEffect(() => {    
    let headersList = {
      "Accept": "*/*",
      "Authorization": "bearer "+process.env.github_read_token,
      "Content-Type": "application/json",
    };

    let gqlBody = {
      query: `query ($repoOwner: String!, $repoName: String!) {
       repository(owner: $repoOwner, name: $repoName) {
         languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
           totalSize
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
      variables: { repoOwner: "yonatanmgr", repoName: "mathberet" },
    };

    let bodyContent = JSON.stringify(gqlBody);

    fetch("https://api.github.com/graphql", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    })
      .then((res) => res.json())
      .then((text) => setData(text.data.repository.upCase.text));
  }, []);

  return (
    <>{data}</>
  )
}
