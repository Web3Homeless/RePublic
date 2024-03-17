#!sh

pnpm compile-worker

while true
do
  pnpm run-worker
  sleep 10
done
