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
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  z-index: 1;
  }
  .content-container > img {
  height: 12px;
  width: auto;
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  }
  .logo-container {
      font-size: 36px;
      font-weight: 600;
      color: #FFF;
      margin-bottom: 24px;
      font-family: Rubik, sans-serif;
  }
  .logo-container > span {
      font-weight: 300;
  }
  .name-container {
  background: rgba(0, 0, 0, 0.25);
  padding: 24px;
  border-radius: 16px;
  color: #FFFFFF;
  font-family: Rubik, sans-serif;
  display: flex;
  align-items: center;
  gap: 24px;    
  }
  .name-container > img {
  height: 96px;
  width: 96px;
  border-radius: 8px;
  object-fit: cover;
  }
  .name-text > div:nth-child(1) {
  font-size: 36px;
  font-weight: 300;
  }
  .name-text > div:nth-child(2) {
  font-size: 48px;
  font-weight: 600;
      max-width: 400px;
  }
  img.avatar {
  width: 400px;
  height: 100%;
  object-fit: cover;
  position: absolute;
  right: 0;
  }
</style>
<div class="container">
  <div class="content-container">
    <img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/logotype3.png">
    <div class="logo-container">
      #Wywiad<span>Dnia</span>
    </div>
    <div class="name-container">
    <div class="name-text">
      <div>{{firstName}}</div>
      <div>{{lastName}}</div>
    </div>
    {{#if organisation}}
      <img src="{{organisation.logo.url}}">
    {{/if}}
    </div>
  </div>
  <img src="{{image.url}}" class="avatar">
</div>
`;

