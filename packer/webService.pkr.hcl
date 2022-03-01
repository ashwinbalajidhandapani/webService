packer{
    required_plugins {
      amazon = {
        version = ">= 0.0.1"
        source = "github.com/hashicorp/amazon"
      }
  }

}

source "amazon-ebs" "webServiceAMI"{
    ami_name = "webServiceAMI_test9"
    source_ami = "ami-0661cd3308ec33aaa"
    instance_type= "t2.micro"
    region = "us-east-2"
    profile = "dev"
    ssh_username="ec2-user"
}

build{
    sources = [
        "source.amazon-ebs.webServiceAMI",
    ]
    provisioner "shell" {
      script = "./app.sh"
    }
}

