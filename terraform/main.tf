terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region  = "eu-central-1"
  profile = "personal"
}

resource "aws_security_group" "sg_service_instance" {
  name = "Sg_${var.service_name}"

  lifecycle {
    # Necessary if changing 'name' or 'name_prefix' properties.
    create_before_destroy = true
  }

  ingress {
    description      = "Allow HTTPS TCP port"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Allow HTTP TCP port"
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Allow SSH"
    from_port        = 22
    to_port          = 22
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}

resource "aws_instance" "service_server" {
  ami           = "ami-06c39ed6b42908a36"
  instance_type = "t2.micro"

  tags = {
    Name = var.service_name
  }

  key_name = var.service_key_name

  user_data                   = templatefile("./scripts/instance-provision.yaml", {})
  user_data_replace_on_change = true

  security_groups = ["Sg_${var.service_name}"]
  depends_on      = [aws_security_group.sg_service_instance]
}

output "instance_public_dns" {
  description = "Public DNS address of the EC2 instance"
  value       = aws_instance.service_server.public_dns
}
