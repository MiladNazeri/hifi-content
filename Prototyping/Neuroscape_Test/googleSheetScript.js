 
var currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
var sheet = SpreadsheetApp.getActiveSheet();
var data = sheet.getDataRange().getValues();

function doGet(e) {
  console.log("IN DO GET", JSON.stringify(e.parameter));
//  var e = { parameter: {}};
//  
//  e.parameter.username = "hello";
//  e.parameter.displayName = "hello";
//  e.parameter.date = "hello";
//  e.parameter.event = "test1";
//  e.parameter.rating = "hello";
//  e.parameter.isApp = true;
//  e.parameter.UUID = "hello";
   
//  var name = e.parameter.name || "",
//      userName = e.parameter.userName || "",
//      displayName = e.parameter.displayName || "",
//      date = e.parameter.date || "",
//      start = e.parameter.start || "",
//      stop = e.parameter.stop || "",
//      level = e.parameter.level || "",
//      speed = e.parameter.speed || "",
//      gameType = e.parameter.gameType || "",
//      av = e.parameter.av || "",
//      startTime = e.parameter.startTime || "",
//      stopTime = e.parameter.stopTime || "",
//      id = e.parameter.id || "",
//      duringBeat = e.parameter.duringBeat || "",
//      collisionTime = e.parameter.collisionTime || "",
//      latency = e.parameter.latency || "",
//      averageLatency = e.parameter.averageLatency || "",
//      collisionData = e.parameter.collisionData || "";
  
  var name = e.parameter.name || "",
      userName = e.parameter.userName || "",
      displayName = e.parameter.displayName || "",
      date = e.parameter.date || "",
      start = e.parameter.start || "",
      stop = e.parameter.stop || "",
      levels = e.parameter.levels || "";
  
  if (!currentSpreadsheet.getSheetByName(name + "_" + date)) {
    sheet = currentSpreadsheet.insertSheet(name + "_" + date, 0);

    sheet.appendRow(["Name", "User Name", "Display Name", "Date", "Start", "Stop", "Level", "Speed", "GameType", "AV", "Start Time", "Stop Time", "ID", "During Beat", "Collision Time", "Latency"]);
    
  } else {
    sheet = currentSpreadsheet.getSheetByName(name + "_" + date);
  }
  
  var levelKeys = Object.keys(levels);
  
  var rows = [];
  rows.push(
    [name, userName, displayName, date, start, stop] );
  
  levelKeys.forEach(function(level){
    level = levels[level];
    rows.push(
      ["", "", "", "", "", "", level.level, level.speed, level.gameType, level.av, level.startTime, level.stopTime] );
    var cData = JSON.parse(levels.collisionData);
    cData.forEach(function(dataPoint){
      rows.push(
        [", ", ", ", ", ", ", ", ", ", ", ", dataPoint.id, dataPoint.collisionRecord.duringBeat, dataPoint.collisionRecord.collisionTime, dataPoint.latency, ""]);
    })
    
  });
  
  rows.forEach(function(row){
    sheet.appendRow(row);
  });
  
  var success = ContentService.createTextOutput("Success");
  return success;
  
}

  
function doPost(e) {
  Logger.log("I was called")
  if(typeof e !== 'undefined'){
    sheet.getRange(3, 1).setValue(JSON.stringify(e));
  }

  return ContentService.createTextOutput(JSON.stringify(e))
}
