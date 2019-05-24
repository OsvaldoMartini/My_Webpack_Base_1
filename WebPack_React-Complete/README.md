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
7) git remote add origin https://github.com/OsvaldoMartini/ReactListSingers.git
-) //check out gh-pages
8) git checkout -b gh-pages 
9) git subtree push --prefix dist origin gh-pages

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



