import { Server, GraphQLHTTP } from './deps.ts'
import shark from './shark.ts'
export class Shark {
  endpoints: string[];
  server: Server;
  constructor(endpoints: string[]) {
    this.endpoints = endpoints;
    this.server = new Server();
  }

  async use(middleware: any) {
    await this.server.use(middleware);
  }

  async listen(port: number = parseInt(Deno.env.get("PORT")) || 8000) {
    const { schema, rootValue } = await shark(this.endpoints);
    this.server.post(
      "/graphql",
      async (ctx: any, next: any) => {
        const resp = await GraphQLHTTP({ schema, rootValue, context: (request) => ({ request }), graphiql: true })(ctx.req);
        ctx.res = resp;
        await next();
      },
    );
    console.log(`Shark server listen to http://localhost:${port}`);
    await this.server.listen({ port });
  }

}