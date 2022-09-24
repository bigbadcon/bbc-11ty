/* -------------------------------------------------------------------------- */
/*                             ESlint Global rules                            */
/* -------------------------------------------------------------------------- */
/* -------------------- These are all loaded in html head ------------------- */

/* global dayjs */

// These are to be used in other scripts so ignore unused variables
/* eslint-disable no-unused-vars */

/* -------------------------------------------------------------------------- */
/*                             dayjs event format                             */
/* -------------------------------------------------------------------------- */
/* --------- This is used for online events when timezone can change -------- */

function formatEventDate(date, tz = 'America/Los_Angeles') {
    return dayjs(date).tz(tz).format('MMM D')
  }
  function formatEventDateWithYear(date, tz = 'America/Los_Angeles') {
    return dayjs(date).tz(tz).format('MMM D, YYYY')
  }
  function formatEventTime(date, tz = 'America/Los_Angeles') {
    return dayjs(date).tz(tz).format('h:mma')
  }

  /* --------------------------- Event Duration ------------------------------ */

const getDurationInHours = (dateStart,dateEnd) => {
    dateStart = new Date(dateStart)
    dateEnd = new Date(dateEnd)
    return (Math.abs(dateEnd - dateStart) / 1000) / 3600 % 24;
  }