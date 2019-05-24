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



