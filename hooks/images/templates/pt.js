module.exports = `
<style>
  .container {
  width: 900px;
  height: 500px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(254.81deg, #4B608A 0%, #E26E2D 100.01%);
  }
  .content-container {
  position: absolute;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  margin: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  flex-direction: column;
  }
  .content-container > img {
  height: 12px;
  width: auto;
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  }
  .logo-container {
  height: 100%;
  width: 400px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  }
  .logo-container > img {
  display: block;
  width: 100%;
  height: auto;
  }
  .name-container {
  background: #894A32;
  padding: 24px;
  border-radius: 24px;
  color: #FFFFFF;
  font-family: Rubik, sans-serif;
  text-align: right;
  z-index: 1;
  }
  .name-container > div:nth-child(1) {
  font-size: 48px;
  font-weight: 300;
  }
  .name-container > div:nth-child(2) {
  font-size: 72px;
  font-weight: 600;
  max-width: 400px;
  }
  img.avatar {
  width: 400px;
  height: 100%;
  object-fit: cover;
  position: absolute;
  left: 0;
  box-shadow: 0px 0px 32px 0px #825548;
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
  }
</style>
<div class="container">
  <div class="content-container">
    <img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/logotype3.png">
    <div class="logo-container">
      <img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/pt.png">
    </div>
    <div class="name-container">
      <div>{{firstName}}</div>
      <div>{{lastName}}</div>
    </div>
  </div>
  <img src="{{image.url}}" class="avatar">
</div>
`