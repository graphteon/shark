PWDIR=$(PWD)

all:
	@(trap 'kill 0' SIGINT;cd $(PWDIR)/graphql && luwak server.ts & cd $(PWDIR)/graphql2 && luwak server.ts & luwak server.ts)