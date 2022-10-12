/*
query{
  getExample2(id:1){
    id
    title
    author
    description
  }
}
*/

import { Shark } from '../mod.ts'
const server = new Shark(["http://localhost:3001/graphql", "http://localhost:3002/graphql"]);
await server.listen();