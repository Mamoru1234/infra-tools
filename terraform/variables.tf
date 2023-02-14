variable "service_name" {
  description = "Service name to deploy"
  type        = string
  default     = "TestService"
}

variable "service_key_name" {
  description = "Name of key to access service"
  type        = string
  default     = "my-server"
}
