# UpStarMusic
Starter Repo for a Webpack course on Udemy

You can download this repository by using the green `Clone or Download` button on the right hand side of this page.  This will present you with the option to either clone the repository using Git, or to download it as a zip file.

If you want to download it using git, copy paste the link that is presented to you, then run the following at your terminal:

```
git clone https://github.com/StephenGrider/WebpackProject.git
cd WebpackProject
npm install
```


npm -i -S rimraf


Deployment
npm install -g surge

npm run surge

// it can be any pasword at first 
surge -p dist  


//Google Domain
Add CNAME at the Domain
Instructions:

  -->>  https://surge.sh/help/adding-a-custom-domain

Setting a CNAME
To get started, you’ll need have a custom domain and sign into your account to manage it. now:

1) Add a new CNAME record to your domain.
2) Set the hostnames @ and www to:
-->>  na-west1.surge.sh


If your DNS provider doesn’t support CNAME records for apex domains, you can set an A record to the following IP address instead:
45.55.110.124

surge -p dist  shifthunter.com


Git Hub pages:
--> Video 47 Deploymentwith GitHub Pages (WebPack 2: The complete Developer's Guide)
1) First Create new Repository
2) Public
3) Select Http or  SSH for internal Remote Connection with your machine (Copy the Repository Link)
-- Inside the Project Folder
4) git init
5) git add . //to add all the code
6) git commit -m "initial commit"
-) //add git hub Pages as REmote for this repo

########  DON T RUN THIS IN SUBFOLDERS
7) git remote add origin https://github.com/OsvaldoMartini/My_Webpack_Base_1.git

-) //check out gh-pages
8) git checkout -b gh-pages
9) git subtree push --prefix dist origin gh-pages

10) Extras:
git push --delete <remote_name> <branch_name>
git branch -d <branch_name>
git push origin --delete {the_remote_branch}

After Acces directly github url:
https://osvaldomartini.github.io/ReactListSingers


Video: AWS vis S3
Deployment AWS  via S3 service 
S3 service can be thought of as like a big data directory a big folder sitting out on some server
It is perfect to hosting static websites.
because there's absolutely nologic involved on it
only Server folders and server files its only what it does

1) Create Secrete Key at AWS Amazon

2) Create the ".env" file with the keys:
.env (file) with the Access Keys
AWS_ACCESS_KEY_ID=AKIAJS63L6FJ2REXNEDQ
AWS_SECRET_ACCESS_KEY=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


3) run the command: (Be Aware about the name of the bucket file)
    s3-website create webpack-deploy
        Error: The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again.

    s3-website create webpack-deploy-1234

4) After Created the Bucklet  it needs to deploy

    s3-website deploy dist

5) visit the web site
Updated site: http://webpack-deploy-1234.s3-website-us-east-1.amazonaws.com


Clean Up all AWS DElete the Acces Keys and the S3- Services Buckets


==>>>====>>>>>>>====>>>>>
Videos 49 and 50 To See the Schemas
Node and Webpack Integration

making webpack Middleware.
Creating a Stand Alone Server
npm install --save express

Install Webpack as  Middleware (For Intercept incoming request and hand it off to webpack)
npm install --save-dev webpack-dev-middleware@2.0.6

context.compiler.hooks.invalid.tap('WebpackDevMiddleware', invalid);
//These Version really works together
  "webpack": "^2.2.0-rc.0",
  "webpack-dev-middleware": "^2.0.6",
  "webpack-dev-server": "^2.2.0-rc.0"

Tests as PRODUCTION

1) SET NODE_ENV=production
2) Delete Forlder 'dist'
-) Run Node Server
3) node server.js


====>>>>===>>>>===>>>

Adding some Authentication or Databasic Logic or anything like that
It is to Add Additional Route ABOVE ABOVE ABOVE ALL WEBPACK INFORMATION
//Servers Routes...
app.get('/hello', (req, res) => res.send({ hi: 'there' }));

//AWS and Heroku it Not Allow to Specific the Port here
//But they will want you to bind to a port specified by the server

===>>>>>>>=====>>>>
Defining "Procfile" to run with Horoku

Heroku it work with Git Repository

>git init
>git add .
>git commit -m "Initial"

Install heroku for windows Heroku CLI 

>heroku login
>heroku create
>git remote -v
>git push heroku master
>heroku open
>heroku logs
https://young-hamlet-60067.herokuapp.com/

Git Hub Commands Extras:
New Branch
In Heroku, you may have problems with pushing to the master branch. 
What you can do is to start a new branch using
>git checkout -b tempbranch
and then push using
>git push heroku tempbranch

Change the heroku remote to the new project's git URL
>git remote set-url heroku https://git.heroku.com/polar-cove-4803.git
That will set your remote to your new project and you should be able to
>git push heroku master

Removes
>git remote rm heroku


AWS Elastic Beanstalk
Install AWS Elastic Beanstalk CLI or command line interface:
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html
Install the EB CLI on Linux and macOS
Set  NODE_ENV:
eb open
eb setenv NODE_ENV=production

Some Errors Caught from Python Install:
You are using pip version 19.0.3, however version 19.1.1 is available.
You should consider upgrading via the 'python -m pip install --upgrade pip' command.
>python -m pip install --upgrade pip --user  //--user to get authorization to install inside of the user
and Finally
>pip install virtualenv --user
and More and finally Last one: (Again try to install the interely eb cli)
.\aws-elastic-beanstalk-cli-setup\scripts\bundled_installer

Steps:
Check the Version
>eb --version
>eb init
You must install SSH before continuing:
SSH
By Power Shell as (Administrator):
https://docs.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse

Topic: Installing OpenSSH with PowerShell

1) Step Check if have installation 
# Check if s arllready installed:
> Get-WindowsCapability -Online | ? Name -like 'OpenSSH*'
  # This should return the following output:
  Name  : OpenSSH.Client~~~~0.0.1.0
  State : NotPresent
  Name  : OpenSSH.Server~~~~0.0.1.0
  State : NotPresent

2) Step Install OpenSSH Client
# Install the OpenSSH Client
> Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0

3) Step Install OpenSSH Server
# Install the OpenSSH Server
> Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

4) Step Results
# Results:
# Both of these should return the following output:
Path          :
Online        : True
RestartNeeded : False

5) Miscelaneous -> Unistall OpenSSH
Uninstalling OpenSSH
# Uninstall the OpenSSH Client
>Remove-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
# Uninstall the OpenSSH Server
>Remove-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

6) Start => Initial Configuration of SSH Server ( launch PowerShell as an administrator), then run the following commands to start the SSHD service:
>Start-Service sshd

# OPTIONAL but recommended:
>Set-Service -Name sshd -StartupType 'Automatic'

# Confirm the Firewall rule is configured. It should be created automatically by setup. 
>Get-NetFirewallRule -Name *ssh*
# There should be a firewall rule named "OpenSSH-Server-In-TCP", which should be enabled 

7) Initial use of SSH
Once you have installed the OpenSSH Server on Windows, you can quickly test it using PowerShell from any Windows device with the SSH Client installed. 
In PowerShell type the following command:
>Ssh username@servername

RESTART WINDOWS

open GIT HUB BASH AND:
>ssh-keygen
after rerun 
>eb init...
>eb ssh [environment-name]
>eb ssh webpack-prj

After Correct Connection and Putty Key Gen etc be working:

# Follow the Videos 54 and 55 -> Deployment AWS
>eb create 

After Foloow the Video 54 instructions
AS Result Expected
#  Successfully launched environment: WebPack-React-Complete-dev

# Run the Command
>eb open
Expected Result
502 Bad Gateway (nginx/1.14.1) Server

In AWS Console (Check the Region "London" ) -> EC2 -> Elastic Beanstalk

#Run the command:
> eb setenv NODE_ENV=production
#I am Using EC2 instance type: t2.micro that is the smallest services from AWS

Just rerun:
>npm run build
git init
git add .
git status
git commit -m "New Changes"
This It Will Cretes New Version
>eb deploy   
>eb open

Updating Version
>eb deploy
and
>eb deploy --staged

Changing the Enviroment and Terminating
> eb use WebPac-React-Complete-dev3
> eb terminate

> eb use WebPack-React-Complete-dev
> eb terminate


TERMINATE EVERYTHING
>eb terminate
