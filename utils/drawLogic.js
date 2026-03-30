export const generateDraw = () => {
  let numbers = [];

  while (numbers.length < 5) {
    let num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) numbers.push(num);
  }

  return numbers;
};

export const calculateMatch = (userScores, drawNumbers) => {
  return userScores.filter(score => drawNumbers.includes(score)).length;
};

export const getMatchTier = (matchCount) => {
  if (matchCount >= 5) return "5-number";
  if (matchCount === 4) return "4-number";
  if (matchCount === 3) return "3-number";
  return null;
};
