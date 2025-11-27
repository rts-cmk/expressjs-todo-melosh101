# frameworks1-ExpressJS-todo

I denne opgave skal du bygge en lille webserver med Express.js, der kan håndtere en liste over opgaver (TODOs). Formålet er at give dig praktisk erfaring med at opsætte en server, definere ruter og arbejde med data i JSON-format. Du skal starte med at oprette et nyt projekt, installere Express og sætte en server op, der kan lytte på en port.  

Når serveren er oprettet, skal du lave en datastruktur, for eksempel et array, hvor du gemmer nogle opgaver med en titel og en status (fx “færdig” eller “ikke færdig”). Herefter skal du definere ruter, så klienten kan kommunikere med serveren. Din server skal kunne returnere hele listen af opgaver, returnere en enkelt opgave baseret på id, tilføje nye opgaver, opdatere eksisterende opgaver og slette opgaver.  

Som overordnet struktur kan du tænke på det sådan her:

- Start serveren og sørg for at den kan håndtere JSON-data  
- Opret en liste med opgaver (fx titel og status)  
- Lav en rute der returnerer hele listen  
- Lav en rute der returnerer en enkelt opgave baseret på id  
- Lav en rute der tilføjer en ny opgave til listen  
- Lav en rute der opdaterer en eksisterende opgave  
- Lav en rute der sletter en opgave fra listen  

Når du implementerer ruterne, kan du tage udgangspunkt i Express’ officielle dokumentation for [routing](https://expressjs.com/en/guide/routing.html). Det er vigtigt, at du forstår hvordan `req` og `res` bruges til at håndtere data, og hvordan parametre i URL’en kan tilgås via `req.params`.  

Når du har de grundlæggende funktioner på plads, kan du udvide din server med ekstra funktionalitet. Du kan for eksempel lave en rute, der filtrerer opgaver baseret på status, eller tilføje deadlines til opgaverne. Du kan også overveje, hvordan serveren kunne udvides til at gemme data i en database i stedet for i et array.  

Målet med opgaven er, at du får en forståelse for, hvordan Express håndterer routing og middleware, og hvordan du kan bygge en simpel API, der kan bruges som fundament for en større applikation. Når du er færdig, skal du kunne forklare, hvordan de forskellige ruter fungerer, og hvordan klienten og serveren kommunikerer med hinanden.  

---

## Opsummering

- Opsæt et nyt Node.js-projekt og installer Express  
- Opret en server der lytter på en port  
- Lav en datastruktur (array) med opgaver  
- Implementér ruter til GET, POST, PUT og DELETE  
- Udvid med ekstra funktioner som filtrering eller deadlines  
