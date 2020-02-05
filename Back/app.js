var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var multer = require("multer");
var cors = require("cors");
var fs = require("fs");
var util = require("util");
var cheerio = require("cheerio");
var app = express();
var rp = require("request-promise");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//CREATION FICHIER DEBUG POUR AFFICHER LE CONSOLELOG  DANS UN FICHIER EXTERNE
var log_file = fs.createWriteStream(__dirname + "/log/debug.log", {
  flags: "a+"
});
var log_stdout = process.stdout;
console.log = function(d) {
  //
  log_file.write(util.format(d) + "\r\n");
  log_stdout.write(util.format(d) + "\r\n");
};

//CONFIGURATION MULTER //
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// SAVE FILE MY LOCAL STORAGE //
let upload = multer({ storage: storage });

//SELECTION ELEMENT HTML TRANSORMATION EN JSON//
function transformHTML(body) {
  const $ = cheerio.load(body);
  const resulJson = $(".col2 tr")
    .map((i, el) => {
      const diagCategs = $(el)
        .find("td")
        .first()
        .text();
      const scores = $(el)
        .find("td")
        .last()
        .text();
      let scoresArr = "";
      console.log(scores, "TESTTTTT");

      if (scores.indexOf("e") === -1) {
        if (scores.substr(0, 1) === "1") {
          scoresArr = "100";
        } else {
          scoresArr = scores.substr(2, 2);
          if (parseInt(scoresArr) < 10) {
            scoresArr = scoresArr.substr(1, 1);
          }
        }
      } else {
        scoresArr = "0";
      }

      return { diag: diagCategs, scores: scoresArr };
    })
    .toArray();
  return resulJson;
}

//PERMET DE ENVOYER PLUSIEURS FILES OU UN SEULE FILE //
async function sendFileText(files) {
  const fileToUpload = [];
  if (files.path) {
    fileToUpload.push(fs.createReadStream(files.path));
  } else {
    for (let i = 0; i < files.length; i++) {
      fileToUpload.push(fs.createReadStream(files[i].path));
    }
  }
  const options = {
    url: "http://35.205.33.234:8443/classif/",
    method: "POST",
    formData: {
      inputFiles: fileToUpload
    },
    headers: {
      "content-type": "multipart/form-data ;  charset=utf-8"
    }
  };
  const body = await rp(options); //1er request//
  // createFileLog(body)
  const transformed = transformHTML(body);
  return transformed;
}

async function otherFile(files) {
  const fileToUpload = fs.createReadStream(files.path);

  const options = {
    url: "http://35.205.33.234:5000/",
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data , utf-8"
    },
    formData: {
      file: fileToUpload
    }
  };
  const body = await rp(options); //2end Request //
  console.log(body, "SAVEEE FILEEE OTHER LOG");
  return body;
}

async function sendMultipleFiles(files) {
  //PERMET DE CHOISIR UN FILE OU PLUSIEURS FILES LOCAL//
  //SI LE(S) FILES SONT DES SOUS FORMAT TXT ENVOIE A LA PREMIERE REQUET SINON ENVOIE AU DEUXIEME REQUETS//
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const currentFile = files[i];
    if (currentFile.mimetype !== "text/plain") {
      const text = await otherFile(currentFile);
      fs.writeFileSync(currentFile.path, text);
    }
  }
  //Send multiple files //
  const resultAllFiles = await sendFileText(files);
  results.push({ resulJson: resultAllFiles });

  return results;
}

app.post("/upload", upload.array("file"), function(req, res, next) {
  const file = req.files;
  async function run() {
    const data = await sendMultipleFiles(file);
    res.status(200).send(data);
    console.log(data, " dataaaa");
  }
  run();
});

app.post("/radio", function(req, res, next) {
  const data = req.body.data;
  console.log(data, "DATA ");
  fs.writeFileSync(
    "./public/logfilemodify.txt",
    data["diag"] + " : " + data["scores"],
    { flag: "a" },
    function(err) {
      if (err) {
        return err;
      }
    }
  );
  res.status(200).send(data);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// // error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
// })

module.exports = app;
