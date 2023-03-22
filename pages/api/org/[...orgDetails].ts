// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {

  const req = request.query.orgDetails;
  
  const orgName = req[0];

  let headersList = {
    Accept: "*/*",
    Authorization: "bearer " + process.env.github_read_only,
    "Content-Type": "application/json",
  };

  let gqlBody = {
    query: `query ($login: String!) {
      organization(login: $login) {
        repositories(
          first: 100
          isLocked: false
          isFork: false
          privacy: PUBLIC
          orderBy: {direction: DESC, field: STARGAZERS}
        ) {
          nodes {
            name
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
            shortDescriptionHTML
            pushedAt
          }
        }
      }
    }`,
    variables: { login: orgName },
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
