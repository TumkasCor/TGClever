hvar TelegramBot = require('node-telegram-bot-api');
var tgBot = new TelegramBot('ТОКЕН');
var request = require('request');
var google = require('google'); google.resultsPerPage = 25;
runBot();

function runBot(){
  request({
    url: 'https://api.vk.com/method/streamQuiz.getCurrentStatus?access_token=fb0becc681ac927eaa1bc7af3fbe2e361e6d3f9053f9bea23049bf7f14747e1bc9bf7a693cd4f8059233a&v=5.71&lang=ru',
    encoding: 'utf-8', gzip: true,headers: {'cookie': 'remixlang=0', 'accept': '* /*', 'user-agent': 'StreamQuiz/37 CFNetwork/894 Darwin/17.4.0', 'accept-language': 'ru'}}, function(e, a, r){
    var preUrl = JSON.parse(r);
    console.log('video_id: '+preUrl.response.game.video_id);

    if(typeof preUrl.response.game.video_id !== 'undefined'){
      tgBot.sendMessage('@clever_answer', 'Трансляция началась!')
      request({
        url: 'https://api.vk.com/method/video.getLongPollServer?access_token=fb0becc681ac927eaa1bc7af3fbe2e361e6d3f9053f9bea23049bf7f14747e1bc9bf7a693cd4f8059233a&owner_id='+preUrl.response.game.video_owner_id+'&video_id='+preUrl.response.game.video_id+'&v=5.71&lang=ru',
        encoding: 'utf-8', gzip: true,headers: {'cookie': 'remixlang=0', 'accept': '* /*', 'user-agent': 'StreamQuiz/37 CFNetwork/894 Darwin/17.4.0', 'accept-language': 'ru'}}, function(e, a, rr){
        url = JSON.parse(rr).response.url;

        newPolling(url);
        console.log('poll: '+url)
      });
    }else{
      setTimeout(function(){
        runBot();
      }, 15000)
    }
  });
}

function newPolling(url){
  request({
    url: url,
    encoding: 'utf-8', gzip: true,
    headers: {
      'cookie': 'remixlang=0',
      'accept': '*/*',
      'user-agent': 'StreamQuiz/37 CFNetwork/894 Darwin/17.4.0',
      'accept-language': 'ru'
    }}, function (e, res, r) {
      try{
        var r = JSON.parse(r);

        if(r.events.length !== 0){
          var event = JSON.parse(r.events[0].slice(0, -4));

          if(event.type == 'sq_question'){
            console.log('question num #'+event.question.number)
            processQuestion({q: event.question.text, a1: event.question.answers[0].text, a2: event.question.answers[1].text, a3: event.question.answers[2].text})

          }else{
            if(event.type == 'sq_game_winners'){
              tgBot.sendMessage('@tumkas', 'Игра окончена.\n'+event.winners_num+' победителей. \nСпасибо за игру. Автор бота - @tumkas !')
            }else{
              //console.log(event.type)
            }
          }
        }
        newPolling(url.replace(/(ts=).*?(&)/,'$1'+r.ts+'$2'));
      }catch(e){
        console.log('e: ',e)
      }
  })
}



/*
  GOOGLE PART
*/

function completedOCR(googleSearchResultText, pq) {
    var answers = [
      {
        id: 1,
        text: pq.a1.trim().split(' '),
        score: 0
      },
      {
        id: 2,
        text: pq.a2.trim().split(' '),
        score: 0
      },
      {
        id: 3,
        text: pq.a3.trim().split(' '),
        score: 0
      }
    ];
    var results = queryFrequencyScorer(googleSearchResultText, answers);

    if(/ НЕ /g.test(pq.q)){
        var results = queryFrequencyScorer3(googleSearchResultText, answers);

        if(results[0].score+results[1].score+results[2].score !== 0){
          results.sort((a, b) => b.score - a.score).reverse();
          console.log('===========\n  Answers (method 3 with regex NO)\n===========');
          results.forEach(function(ans, i) {console.log('%s - score: %s', ans.text.join(' '), ans.score);})
          console.log('\n\nBEST ANSWER: '+results[0].text.join(' ')+' NUM: '+results[0].id);tgBot.sendMessage('@tumkas', 'Лучший ответ: '+results[0].text.join(' ')+' (Совпадений: '+results[0].score+')\n\nНомер: '+results[0].id);
        }
    }else{
      if(res lts[0].score+results[1].score+results[2].score !== 0){
        results.sort((a, b) => b.score - a.score);
        console.log('===========\n  Answers (method 1)\n===========');
        results.forEach(function(ans, i) {console.log('%s - score: %s', ans.text.join(' '), ans.score);})
        if(results[0].score !== 0){console.log('\n\nBEST ANSWER: '+results[0].text.join(' ')+' NUM: '+results[0].id);tgBot.sendMessage('@tumkas', 'Лучший ответ: '+results[0].text.join(' ')+' (Совпадений: '+results[0].score+')\n\nНомер: '+results[0].id);}
      }else{
        var results = queryFrequencyScorer2(googleSearchResultText, answers);

        if(results[0].score+results[1].score+results[2].score !== 0){
          results.sort((a, b) => b.score - a.score);
          console.log('===========\n  Answers (method 2)\n===========');
          results.forEach(function(ans, i) {console.log('%s - score: %s', ans.text.join(' '), ans.score);})
          if(results[0].score !== 0){console.log('\n\nBEST ANSWER: '+results[0].text.join(' ')+' NUM: '+results[0].id);tgBot.sendMessage('@tumkas', 'Лучший ответ: '+results[0].text.join(' ')+' (Совпадений: '+results[0].score+')\n\nНомер: '+results[0].id);}
        }else{
          var results = queryFrequencyScorer3(googleSearchResultText, answers);

          if(results[0].score+results[1].score+results[2].score !== 0){
            results.sort((a, b) => b.score - a.score);
            console.log('===========\n  Answers (method 3)\n===========');
            results.forEach(function(ans, i) {console.log('%s - score: %s', ans.text.join(' '), ans.score);})
            if(results[0].score !== 0){console.log('\n\nBEST ANSWER: '+results[0].text.join(' ')+' NUM: '+results[0].id);tgBot.sendMessage('@tumkas', 'Лучший ответ: '+results[0].text.join(' ')+' (Совпадений: '+results[0].score+')\n\nНомер: '+results[0].id);}
          }else{
            tgBot.sendMessage('@tumkas', 'Ответ не найден, ссылка на гугл:\nhttps://google.com/search?q='+encodeURIComponent(pq.q+' '+pq.a1+' '+' '+pq.a2+' '+' '+pq.a3));
          }
        }
      }
    }
}

function processQuestion(pq){
  var questionText = pq.q,
      ansOneText = pq.a1,
      ansTwoText = pq.a2,
      ansThreeText = pq.a3,
      googleSearchResultText;

  google(questionText, function(err, res) {
    if (err) throw err;

    googleSearchResultText = res.links.map(obj => Object.values(obj).join(' ')).join(' ').replace(/\n/gi, ' ').trim().toLowerCase();
    console.log('Google Search results fetched successfully!');
    //console.log(googleSearchResultText)
    completedOCR(googleSearchResultText, pq);
  });
}


function queryFrequencyScorer(results, query) {
  for(var i in query) {
    var occurrences = results.toLowerCase().match(new RegExp(query[i].text.join(' ').toLowerCase(), 'g'));
    if(occurrences) {
      // Adds number of occurences of each word to the score of the corresponding answer
      query[i].score += occurrences.length;
    }
  }

  return query;
}

function queryFrequencyScorer2(results, query) {
  for(var i in query) {
    for(var j in query[i].text) {
      if(query[i].text[j].length !== 1){
        var occurrences = results.toLowerCase().match(new RegExp(query[i].text[j].toLowerCase(), 'gi'));
        if(occurrences) {
          // Adds number of occurences of each word to the score of the corresponding answer
          query[i].score += occurrences.length;
        }
      }
    }
  }

  return query;
}

function queryFrequencyScorer3(results, query) {
  for(var i in query) {
    for(var j in query[i].text) {
      var occurrences = results.toLowerCase().match(new RegExp(query[i].text[j].toLowerCase().replace(/(?<=[а-яё])(ы|у|ем|ым|ет|им|ам|ить|ий|ю|ый|ой|ая|ое|ые|ому|а|о|у|е|ого|ему|и|ых|ох|ия|ий|ь|я|он|ют|ат)(?![а-яё])/gi, ''), 'i'));
      if(occurrences) {
        // Adds number of occurences of each word to the score of the corresponding answer
        query[i].score += occurrences.length;
      }
    }
  }

  return query;
}
