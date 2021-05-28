module.exports = `
<style>
  .container {
  width: 900px;
  height: 500px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(105.28deg, #005669 0%, #004655 100%);
  }
  .content-container {
  position: absolute;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  margin: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 1;
  }
  .content-container > img {
  height: 12px;
  width: auto;
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  }
  img.avatar {
  width: 450px;
  height: 100%;
  object-fit: cover;
  position: absolute;
  left: 0;
  }
  img.avatar:last-child {
      right: 0;
      left: unset;
  }
  .name-container {
     padding: 16px;
     border-radius: 8px;
     display: flex;
     gap: 16px;
     align-items: center;
     background: linear-gradient(91.81deg, #E2D02D 0%, #E00051 96.93%);
     color: #FFF;
     font-family: Rubik, sans-serif;
  }
  .name-container > img {
      height: 64px;
      width: 64px;
      object-fit: cover;
      border-radius: 4px;
  }
  .name-text > div:nth-child(1) {
      font-weight: 300;
      font-size: 24px;
  }
  .name-text > div:nth-child(2) {
      font-weight: 600;
      font-size: 36px;
      max-width: 300px;
      line-height: 1;
  }
  .logo-container {
    position: absolute;
    background: #E4BB35;
    padding: 12px 16px;
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }
  .logo-container > img {
    width: 200px;
    height: auto;
    display: block;
    margin: -8px;
    margin-bottom: -24px;
    margin-left: -32px;
    margin-right: -32px;
  }
  .vs-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -75%);
    z-index: 2;
    padding: 24px;
    font-weight: 600;
    font-size: 96px;
    background: #E00A50;
    box-shadow: 0px 0px 32px #E00A50;
    border-radius: 24px;
    color: #FFFFFF;
    font-family: Rubik, sans-serif;
    line-height: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80px;
    width: 120px;
  }
</style>
<div class="container">
  <div class="vs-container">VS</div><div class="logo-container">
        <img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/rp.png">
    </div><div class="content-container">
    <img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/logotype3.png">
    {{#each politicians}}
      <div class="name-container">
      <div class="name-text">
        <div>{{firstName}}</div>
        <div>{{lastName}}</div>
      </div>
      {{#if organisation}}
        <img src="{{organisation.logo.url}}">
      {{/if}}
      </div>
    {{/each}}
  </div>
  {{#each politicians}}
    <img src="{{image.url}}" class="avatar">
  {{/each}}
</div>
`;
