locals {
  # get the environment variables from the .env file
  dot_env_file_path = "${path.root}/../.env"
  environment_variables_lines = [for line in split("\n", file(local.dot_env_file_path)) : trimspace(line)]
  environment_variable_regex  = "^(\\w*)=(.+)$"
  environment_variables = flatten([
    for line in local.environment_variables_lines :
    [for tuple in regexall(local.environment_variable_regex, line) : { name : tuple[0], value : sensitive(tuple[1]) }]
  ])

  # Helper function to get env var or fail
  get_env = function(var_name) {
    index = index([for v in local.environment_variables : v.name], var_name)
    value = try(local.environment_variables[index].value, null)
    if value == null then
      fail("Environment variable ${var_name} not found in .env file")
    else
      value
  }

  # set the local variables
  aws_account_id = local.get_env("AWS_ACCOUNT_ID")
  aws_region     = local.get_env("AWS_REGION")
  environment    = "dev"
  project        = "batu-energy"
}