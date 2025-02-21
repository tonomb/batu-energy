provider "aws" {
  region     = local.aws_region
  access_key = local.aws_access_key_id
  secret_key = local.aws_secret_access_key
}

// Lambda function
resource "aws_lambda_function" "optimize_function" {
  filename      = "../apps/api/dist/optimize-function.zip"
  function_name = "optimize-function"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambdas/lambda.handler"
  runtime       = "nodejs20.x"

  environment {
    variables = {
      BATU_ENERGY_API_KEY = local.batu_energy_api_key,
      BATU_ENERGY_API_URL = local.batu_energy_api_url
    }
  }
}

// API Gateway
resource "aws_api_gateway_rest_api" "optimize_api" {
  name        = "optimize-api"
  description = "API for optimizing battery storage arbitrage"
}

resource "aws_api_gateway_resource" "optimize_resource" {
  rest_api_id = aws_api_gateway_rest_api.optimize_api.id
  parent_id   = aws_api_gateway_rest_api.optimize_api.root_resource_id
  path_part   = "optimize"
}

resource "aws_api_gateway_method" "optimize_post" {
  rest_api_id   = aws_api_gateway_rest_api.optimize_api.id
  resource_id   = aws_api_gateway_resource.optimize_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.optimize_api.id
  resource_id             = aws_api_gateway_resource.optimize_resource.id
  http_method             = aws_api_gateway_method.optimize_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.optimize_function.invoke_arn
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.optimize_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.optimize_api.execution_arn}/*/*"
}

// API Gateway Deployment and Stage
resource "aws_api_gateway_deployment" "optimize" {
  rest_api_id = aws_api_gateway_rest_api.optimize_api.id

  depends_on = [
    aws_api_gateway_integration.lambda_integration,
    aws_api_gateway_method.optimize_post,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_stage" "optimize" {
  deployment_id = aws_api_gateway_deployment.optimize.id
  rest_api_id   = aws_api_gateway_rest_api.optimize_api.id
  stage_name    = "dev"
} 