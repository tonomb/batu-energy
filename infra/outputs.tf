output "api_url" {
  description = "The URL of the API Gateway"
  value       = aws_api_gateway_rest_api.optimize_api.execution_arn
} 