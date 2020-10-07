# Github Events Calendar

Automatically creates an iCal calendar file based on issues that follow a specific format.

Issues are filtered by a label (like "call") and need to include the following meta data at the top.

## Issue formatting

Only issues with the UTCTime (capitalization does not matter) are used.

```meta
UTCTime: 2020-10-14T09:00:00.000-07:00
```

Optional properties.

```meta
duration: 3600000
```

Duration defaults to 1 hour (3600000 milliseconds)

## Steps

- The action is called every time an issue in the repo is created or edited
- Fetch issues with a specific label from an orgs repo
- Parses each issue for event meta data
- Add matching issues to an ical event calendar
- Creates and commits the iCal file

## Configuration

- domain:
- company:
- name:
- timezone: ('US/Pacific')
- repository: ('owner,repo,label')
- file: The iCal file to write ('events.ical')
