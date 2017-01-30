# split-eat-aws
spilt it repo for aws

Details of APIs :
1. get user :
API : GET
Response :
```
{
  "groupies": [
    {
      "groupieId": "panchobanjyon",
      "outstanding": 500
    }
  ],
  "username": "Debayan Das",
  "userId": "debayan.das"
}

```

2. get groupie details
API :
Response :
```
{
  "groupieId": "panchobanjyon",
  "groupieName": "Pancho Banjyon",
  "outstanding": [
    {
      "userId": "debayan.das",
      "username": "Debayan Das",
      "outstanding": 500
    },
    {
      "userId": "arnab.banerji",
      "username": "Arnab Banerji",
      "outstanding": -300
    },
    {
      "userId": "swarnadipa.choudhury",
      "username": "Swarnadipa Choudhury",
      "outstanding": -300
    },
    {
      "userId": "debjyoti.paul",
      "username": "Debjyoti Paul",
      "outstanding": 100
    },
    {
      "userId": "indranil.choudhury",
      "username": "Indranil Choudhury",
      "outstanding": 0
    }
  ]
}
```
3. get transaction of a group :
API : GET
Response :
```

```