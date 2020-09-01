import {ActivityTypes, Training} from '../database/models';
import {v4} from 'uuid';

/**
 * @description Returns Date object with week offset from current date
 * @param {number} weekOffset
 * @return {Date}
 */
function getDate(weekOffset: number): Date {
  const date = new Date();
  const changedDate = date.getDate() + (7 * weekOffset);

  date.setDate(changedDate);

  return date;
}

/**
 * @description Returns random number from given range(inclusive)
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function getRandomAt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @description Returns Uppercase letter from ASCII char codes table
 * @return {string}
 */
function getUppercaseLetter(): string {
  return String.fromCharCode(getRandomAt(65, 90));
}

/**
 * @description Returns Lowercase letter from ASCII char codes table
 * @return {string}
 */
function getLowercaseLetter(): string {
  return String.fromCharCode(getRandomAt(97, 122));
}

/**
 * @description Generate random string(name) with given length
 * @param {number} length
 * @return {string}
 */
function generateName(length: number): string {
  let result = '';

  for (let i = 0; i < length; i++) {
    if (i == 0) {
      result += getUppercaseLetter();
    } else {
      result += getLowercaseLetter();
    }
  }

  return result;
}

/**
 * @description Returns random full name
 * @return {string}
 */
function getFullName(): string {
  const nameLength = getRandomAt(4, 9);
  const surnameLength = getRandomAt(3, 7);

  return `${generateName(surnameLength)} ${generateName(nameLength)}`;
}

/**
 * @description Returns random activity type
 * @return {ActivityTypes}
 */
function getActivityType(): ActivityTypes {
  const indexToActivityType = [
    ActivityTypes.RUN,
    ActivityTypes.WALKING,
    ActivityTypes.BICYCLE,
    ActivityTypes.SKIING,
  ];

  return indexToActivityType[getRandomAt(0, indexToActivityType.length - 1)];
}

/**
 * @description Generates one instance of Training interface
 * @param {index} index
 * @return {Training}
 */
export const generateTraining = (index: number): Training => {
  return {
    ID: v4(),
    date: getDate(index),
    fullName: getFullName(),
    activityType: getActivityType(),
    distance: getRandomAt(1, 99),
    comment: '',
  };
};
