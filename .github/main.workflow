workflow "publish on release" {
  on = "push"
  resolves = ["publish"]
}

action "publish" {
  uses = "actions/npm@master"
  args = "publish"
  secrets = ["77cd6a03-5851-4997-ba04-a529eb3a7629"]
}