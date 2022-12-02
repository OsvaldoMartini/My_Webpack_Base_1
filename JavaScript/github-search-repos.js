// Octokit.js
// https://github.com/octokit/core.js#readme

// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
// const octokit = new Octokit({ auth: `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` });

// const response = await octokit.request("GET /orgs/companieshouse/repos", {
//   org: "octokit",
//   type: "private",
// });


// console.log(response);

// curl  -H "Accept: application/vnd.github+json" -H "Authorization: Bearer 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" https://api.github.com/orgs/companieshouse/repos?page=1&per_page=1000
// curl  -H "Accept: application/vnd.github+json" -H "Authorization: Bearer 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" https://api.github.com/orgs/companieshouse/repos?page=1&per_page=1000 >> list_of_repos.txt

// RATE LIMIT STATUS
// curl -H "Accept: application/vnd.github+json" -H "Authorization: Bearer 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" https://api.github.com/rate_limit


//https://github.com/companieshouse/filing-notification-sender/search?q=%22filing_received_email%22




var return_first;

function callback(response) {

  names = ['John', 'Ana', 'Mary'];
  var interval = 5000;
  response.forEach((element, i) => {
   setTimeout(async () => {
      console.log(i, element.html_url);
           word = "__CA";
      codeLanguage= "tx"
      await $.ajax({
        // url: "https://api.github.com/orgs/companieshouse?q=siddhant in:name type:user repos:%3E30+filing-notification-sender:%3E10",
        // url: "https://github.com/companieshouse/filing-notification-sender/search?q=email",
        //  url:"https://api.github.com/search/code?q=system+in:file+language:js+repo:reactjs/reactjs.org",
        //  url:"https://api.github.com/search/code?q=system+in:file+language:css+repo:reactjs/reactjs.org",
        //url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`,
        url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}+repo:companieshouse/ch.gov.uk+org:companieshouse`,
        // url:"https://api.github.com/search?utf8=%E2%9C%93&q=amazing+language%3Ago&type=Code",
        jsonp: true,
        Authorization: "Bearer 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",
        method: "GET",
        dataType: "json",
        Accept: "application/vnd.github+json",
        success: function(resp) {
         console.log(resp);
        }
       });
   }, i * interval);  // one sec interval
  });

  //use return_first variable here
  // var interval = 5000;
  // response.forEach((element, index) => {
  //   setTimeout(async function(){
  //     console.log(element.html_url);
  //     word = "transactionId";
  //     codeLanguage= "java"
  //     // await $.ajax({
  //     //   // url: "https://api.github.com/orgs/companieshouse?q=siddhant in:name type:user repos:%3E30+filing-notification-sender:%3E10",
  //     //   // url: "https://github.com/companieshouse/filing-notification-sender/search?q=email",
  //     //   //  url:"https://api.github.com/search/code?q=system+in:file+language:js+repo:reactjs/reactjs.org",
  //     //   //  url:"https://api.github.com/search/code?q=system+in:file+language:css+repo:reactjs/reactjs.org",
  //     //   url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`,
  //     //   // url:"https://api.github.com/search?utf8=%E2%9C%93&q=amazing+language%3Ago&type=Code",
  //     //   jsonp: true,
  //     //   Authorization: "Bearer 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",
  //     //   method: "GET",
  //     //   dataType: "json",
  //     //   Accept: "application/vnd.github+json",
  //     //   success: function(resp) {
  //     //    console.log(resp);
  //     //   }
  //     // });
  // }, interval)
    


 

  // url: "https://api.github.com/orgs/companieshouse?q=siddhant in:name type:user repos:%3E30+filing-notification-sender:%3E10",
      // url: "https://github.com/companieshouse/filing-notification-sender/search?q=email",
      //  url:"https://api.github.com/search/code?q=system+in:file+language:js+repo:reactjs/reactjs.org",
      //  url:"https://api.github.com/search/code?q=system+in:file+language:css+repo:reactjs/reactjs.org",
     // url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`,
      // url:"https://api.github.com/search?utf8=%E2%9C%93&q=amazing+language%3Ago&type=Code",


    // $.ajax({
    //   // url: "https://api.github.com/orgs/companieshouse?q=siddhant in:name type:user repos:%3E30+filing-notification-sender:%3E10",
    //   // url: "https://github.com/companieshouse/filing-notification-sender/search?q=email",
    //   //  url:"https://api.github.com/search/code?q=system+in:file+language:js+repo:reactjs/reactjs.org",
    //   //  url:"https://api.github.com/search/code?q=system+in:file+language:css+repo:reactjs/reactjs.org",
    //   url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`,
    //   // url:"https://api.github.com/search?utf8=%E2%9C%93&q=amazing+language%3Ago&type=Code",
    //   jsonp: true,
    //   Authorization: "Bearer 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",
    //   method: "GET",
    //   dataType: "json",
    //   Accept: "application/vnd.github+json",
    //   success: function(resp) {
    //    console.log(resp);
    //   }
    // });
 
  


  // });
}


//making Ajax Async
function asyncAjax(url){
  return new Promise(function(resolve, reject) {
          $.ajax({
              url: url,
              jsonp: true,
              // username:"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",
              Authorization: "Bearer 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",
              method: "GET",
              dataType: "json",
              Accept: "application/vnd.github+json",
              beforeSend: function() {            
              },
              success: function(data) {
                  resolve(data) // Resolve promise and when success
              },
              error: function(err) {
                  reject(err) // Reject the promise and go to catch()
              }
          });
  });
}


// function pullingSearch(data) {

//    //use return_first variable here
//    data.forEach(async element => {
//     console.log(element.html_url);
//     word = "transactionId";
//     codeLanguage= "java"
//      // url: "https://api.github.com/orgs/companieshouse?q=siddhant in:name type:user repos:%3E30+filing-notification-sender:%3E10",
//       // url: "https://github.com/companieshouse/filing-notification-sender/search?q=email",
           
//       // THIS IS GOOD
//       //  url:"https://api.github.com/search/code?q=system+in:file+language:js+repo:reactjs/reactjs.org",
//       //  url:"https://api.github.com/search/code?q=system+in:file+language:css+repo:reactjs/reactjs.org",
//       //  url:"https://api.github.com/search?utf8=%E2%9C%93&q=amazing+language%3Ago&type=Code",
//       //  url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`,


//       try {
//         const res = await asyncAjax(`https://api.github.com/search/code?q=transactionId+in:file+language:java=repo:companieshouse/abridged.accounts.api.ch.gov.uk+org:companieshouse`)
//         console.log(res)
//       } catch(err) {
//         console.log(err);
//      }
//      await sleep(i * 5000);
//   });
// }

word = "CAS";
codeLanguage= "java"
$.ajax({
 // url: "https://api.github.com/orgs/companieshouse/repos?page=1&per_page=1000",
  //url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}+repo:companieshouse/ch.gov.uk+org:companieshouse`,
  url:`https://api.github.com/search/code?q=${word}+in:file+language:${codeLanguage}+org:companieshouse`,
  jsonp: true,
  Authorization: "Bearer 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",
  method: "GET",
  // cors: true ,
  // secure: true,
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  // },
  dataType: "json",
  Accept: "application/vnd.github+json",
  success: function(data) {
    // callback(data);
    console.log("Total items:", data.items.length);

    data.items.forEach(element => {
      console.log(element.html_url);

    });

    if (data.items && data.items.length === 0){
      console.log("Zero items")
    }

  },
  error: function(jqXHR, textStatus, errorThrown) {
    //callback(jqXHR);
    console.log(qXHR, textStatus, errorThrown);
  }
});


// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function demo() {
//   for (let i = 0; i < 5; i++) {
//       console.log(`Waiting ${i} seconds...`);
//       await sleep(i * 1000);
//   }
//   console.log('Done');
// }

//demo();