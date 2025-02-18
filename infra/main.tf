provider "aws" {
  region = "us-east-1" # Change to your preferred region
}

resource "aws_lambda_function" "optimize_function" {
  function_name = "optimizeFunction"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs14.x" # Ensure this matches your Node.js version
  filename      = "path/to/your/lambda/deployment/package.zip" # Update with your deployment package path

  environment {
    variables = {
      # Add any environment variables your function needs
    }
  }
}

resource "aws_api_gateway_rest_api" "optimize_api" {
  name        = "OptimizeAPI"
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