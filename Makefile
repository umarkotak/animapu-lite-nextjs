run:
	bun --bun run dev

build:
	bun --bun run build

start: build
	bun --bun run start

.PHONY: run build start startd startd-run stopd deploy

startd: stopd build startd-run

startd-run:
	: > animapu-web.log
	nohup bun --bun run start > animapu-web.log 2>&1 & echo $$! > animapu-web.pid

stopd:
	@if [ -f animapu-web.pid ]; then \
		kill "$$(cat animapu-web.pid)" 2>/dev/null || true; \
		rm -f animapu-web.pid; \
	fi

deploy:
	git pull --rebase origin main
	$(MAKE) build
	$(MAKE) stopd
	$(MAKE) startd-run
