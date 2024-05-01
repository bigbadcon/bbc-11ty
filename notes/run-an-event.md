# Run an Event Form

The new form uses Action Form and sends it to serverless function to save to google form and to the Little Red Event Manager. It needs to transform variables to match Little Red Event Manager's API.

## Little Red Event Manager Event Create

```
{
  "accessabilityOptions": "string",
  "additionalGms": "string",
  "additionalRequirements": "string",
  "characters": "string",
  "contentAdvisory": true,
  "eventCategoryId": 0,
  "eventDescription": "string",
  "eventFacilitators": "string",
  "eventMetadataIds": [
    0
  ],
  "eventMetadataNamesString": "string",
  "eventName": "string",
  "eventTags": [
    "string"
  ],
  "format": "string", //format
  "gm": "string",
  "gmAge": "string", // yourAge
  "length": "string",
  "minPlayers": "string",
  "otherInfo": "string",
  "playerAge": "string",
  "players": "string",
  "playtest": "string",
  "requestMediaEquipment": "string"
  "requestMediaRoom": true
  "requestPrivateRoom": "string"
  "runNumberOfTimes": 0,
  "safetyTools": "string",
  "schedulingPref": "string",
  "system": "string",
  "tableType": "string"
  "triggerWarnings": "string",
  "userDisplayName": "string"
}
```

## To Dos
- [x] Add action-form data-preview-label for af-preview since some of the field names are weird due to eventApi; or use the labels
- [x] Review original form for any oddities that need to be transformed
- [x] Create eventMeta object with IDs for the event submission form. Note that the ids in eventsMeta.json are off. See the ones in the form-run-an-event
- [x] Build out the event submission function (see [sheet for transforms needed](https://docs.google.com/spreadsheets/d/1ZVDMp-DqEEPzSpxoLARgqtO8ulA2VUViyrfiVB3VCDM/edit#gid=0))
- [ ] Add on google sheet to the event submission
- [ ] Add success and failure page routes to the event submission
- [ ] Add image upload to success page using searchParam query for eventID. Make this a persistent page that can be returned to later with the event id.
- [ ] QA it all