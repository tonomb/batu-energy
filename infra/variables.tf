locals {
  # get the environment variables from the .env file
  dot_env_file_path           = "../.env"
  environment_variables_lines = [for line in split("\n", file(local.dot_env_file_path)) : trimspace(line)]
  environment_variable_regex  = "^(\\w*)=(.+)$"
  environment_variables = flatten([
    for line in local.environment_variables_lines :
    [for tuple in regexall(local.environment_variable_regex, line) : { name : tuple[0], value : sensitive(tuple[1]) }]
  ])

  # get indices for our environment variables
  aws_account_id_index = index([for v in local.environment_variables : v.name], "AWS_ACCOUNT_ID")
  aws_region_index = index([for v in local.environment_variables : v.name], "AWS_REGION")
  aws_access_key_id_index = index([for v in local.environment_variables : v.name], "AWS_ACCESS_KEY_ID")
  aws_secret_access_key_index = index([for v in local.environment_variables : v.name], "AWS_SECRET_ACCESS_KEY")
  batu_energy_api_key_index = index([for v in local.environment_variables : v.name], "BATU_ENERGY_API_KEY")
  batu_energy_api_url_index = index([for v in local.environment_variables : v.name], "BATU_ENERGY_API_URL")

  # set the local variables
  aws_account_id       = local.environment_variables[local.aws_account_id_index].value
  aws_region          = local.environment_variables[local.aws_region_index].value
  aws_access_key_id   = local.environment_variables[local.aws_access_key_id_index].value
  aws_secret_access_key = local.environment_variables[local.aws_secret_access_key_index].value
  batu_energy_api_key = local.environment_variables[local.batu_energy_api_key_index].value
  batu_energy_api_url = local.environment_variables[local.batu_energy_api_url_index].value
  environment         = "dev"
  project             = "batu-energy"
}