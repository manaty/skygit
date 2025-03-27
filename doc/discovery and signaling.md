**flow** explaining how, with **no dedicated signaling or presence server**, the application can:

1. **Retrieve** the list of conversations from a user’s personal GitHub repo, and  
2. **Establish** WebRTC sessions among participants purely via **GitHub discussions** (acting as a makeshift signaling channel).  


## 1. **Retrieving the List of Conversations**

1. **User Logs in with GitHub**  
   - The app uses **GitHub OAuth** to obtain a token.  
   - Once authenticated, the app can read/write to the user’s **personal repo**  `skygit-config` via the GitHub REST APIs.

2. **SkyGit `skygit-config` Repo**   
   - This repo contains a **`.messages/`** directory 
   - Each conversation is represented by a JSON/Markdown file in that folder.  
     - Example: `.messages/conversation-123.json`  

3. **List Conversations**  
   - The app calls **GitHub’s API** to list files under `skygit-config/.messages/`.  
     - `GET /repos/<user>/skygit-config/contents/.messages`  
   - For each file, the app retrieves minimal metadata (e.g., conversation title, last updated time, url of the associated github repo).  
   - The user sees a list of available conversations in the UI.

4. **Load Conversation Details**  
   - When the user selects a conversation, the app fetches/parses the corresponding JSON file in the .messages directory of its associated github repo to get previous messages.
   - If then fetch “signaling” data from github discussions (more on that below).

## 2. **Presence & Slow Poll**

1. **Presence Data**  
   - Each participant posts a JSON snippet in the **Discussion**  indicating “I am online” (with a timestamp).  
   - This is posted **once** when the user enters the conversation.

2. **Slow Poll** (Once per Minute)  
   - The app checks the Discussion for **new** presence comments.  
   - If no new presence or call signals are found, it simply waits another minute.  
   - This keeps background API usage minimal.

3. **Detecting a New Member**  
   - When the slow poll sees that a new participant has joined (presence info from a new user) **or** an existing user posted an **offer** for a call, it triggers the next phase.

---

## 2. **Fast Poll for Handshake**

1. **Trigger Condition**  
   - Either the user themselves initiated a new call (posted an **offer**),  
   - Or the slow poll found that someone else posted an **offer** .  
   - The app now switches into a **5-second polling**.

2. **Offer/Answer/ICE Exchange**  
   - During this high-frequency poll, the app fetches new comments in the Discussion to gather:  
     - **Offers** (if posted by others),  
     - **Answers** (in response to your own offer),  
     - **ICE candidates** to finalize NAT traversal.  
   - Each new piece of data is processed quickly to accelerate the handshake.

3. **Handshake Completion**  
   - Once the app has a stable **WebRTC** connection (i.e., both sides have set the remote descriptions and ICE candidates), it drops back to **slow poll** again.  
   - If a peer times out (e.g., no response after some threshold), revert to slow poll as well.

