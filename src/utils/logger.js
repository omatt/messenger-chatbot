export const logAnswers = (listAnswers) => {
  console.log("logAnswers listAnswers length " + Object.keys(listAnswers).length);
  for (let index = 0; index < Object.keys(listAnswers).length; index++) {
    console.log("logAnswers " + listAnswers[index].answerType + " " + listAnswers[index].answerText);
  }
}