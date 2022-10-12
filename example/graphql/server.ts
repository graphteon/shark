import { Remora } from 'https://deno.land/x/remora/mod.ts'

const server = new Remora("./lambdas");
await server.listen(3001);