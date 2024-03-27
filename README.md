![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-generate-report

This is an n8n community node. It lets you fill a docx file with data using placeholders.

![image](https://user-images.githubusercontent.com/74856333/231965567-1669d63f-8cca-47b0-9566-9dbc1555915d.png)

![2024-03-27 13_46_58-Window](https://github.com/bramkn/n8n-nodes-generate-report/assets/74856333/967a568a-8fdf-4fb1-b782-8799a6430112)

For this node this package was used: https://www.npmjs.com/package/easy-template-x
For more info on it's use please have a look overthere.
The start and end tag for normal data are {{ }} instead of the standard { }
The tags for lists/containers are the same as default.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Developer

Hi, 

My name is Bram and I am the developer of this node.
I am an independant consultant and expert partner of n8n.
My nodes are free to use for everyone, but please consider [donating](https://donate.stripe.com/3cs5oe7xM6L77Yc5ko) when you use my nodes.
This helps me to build and maintain nodes for everyone to use.

If you are looking for some outside help with n8n, I can of course also offer my services.
* Node Development
* Workflow Development
* Mentoring
* Support

Please contact me @ bram@knitco.nl if you want to make use of my services.

For questions or issues with nodes, please open an issue on Github.

## Sponsor

This node was developed for a client and they allowed me to make it public. 

Developed for [Energy SOAR](https://energysoar.com?ref=kr495s) - Security orchestration, automation and response tool.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

For the convert to PDF functionality you need to have Libre Office installed on the server.

## Operations

* Fill in placeholders of a DocX file.
* Convert to pdf with Libre office, keep in mind that Libre office should be installed on the server. When using Docker it needs to be installed inside the image.

## Compatibility

Developed on an older version of n8n but since then tested on version 0.222.1

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## Version history

v1.0
