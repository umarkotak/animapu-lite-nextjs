run:
	bun --bun run dev

build:
	bun --bun run build

start: build
	bun --bun run start

startd: build
	nohup bun --bun run start > animapu-web.log 2>&1 &
