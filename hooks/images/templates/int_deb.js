module.exports = `
<style>
  .container {
  width: 900px;
  height: 500px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(107.28deg, #00262F 0%, #015467 100%);
  }
  .content-container {
  position: absolute;
  width: calc(100% - 48px);
  height: calc(100% - 48px);
  margin: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 40px;
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
  .logo-container {
    font-weight: 600;
    font-size: 60px;
    color: #F2C94C;
    font-family: Rubik, sans-serif;
      
  }
    .logo-container > span {
        font-weight: 300;
    }

    .list {
         display: flex;
        gap: 24px;
        justify-content: center;
        align-items: center;
        filter: drop-shadow(0px 0px 32px rgba(0, 20, 24, 0.5));
    }
    
   
    .list > img {
        height: 96px;
        width: 96px;
        border-radius: 8px;
        object-fit: cover;
    }
    
    .topic {
        padding: 24px;
        background: #007A95;
        border-radius: 16px;
        font-weight: 600;
        font-size: 48px;
        line-height: 1;
        color: #FFF;
        font-family: Rubik, sans-serif;
    }
</style>
<div class="container">
  <div class="content-container">
    <div class="logo-container">INTERNATIONAL<span>&nbsp;DEBATE</span>
    </div>
<div class="topic">{{title}}</div>
<div class="list">
{{#each organisations}}
    <img src="{{logo.url}}">
    {{/each}}
</div><img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/logotype3.png">
    
</div>
</div>
`