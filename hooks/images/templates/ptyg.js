module.exports = `
<style>
  .container {
  width: 900px;
  height: 500px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(52.6deg, #005D72 0%, #00A1C6 100%);
  }
  .content-container {
  position: absolute;
  width: calc(100% - 48px);
  height: calc(100% - 96px);
  margin: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 1;
      flex-wrap: wrap;
    gap: 16px;
    padding-top: 40px;
    justify-content: center;
    align-items: center;
  
    
  }
  .content-container > img {
  height: 12px;
  width: auto;
  position: absolute;
  right: 0;
  top: 0;
  display: block;
  }
  .name-container {
     padding: 12px;
     border-radius: 0;
     display: flex;
     gap: 16px;
     align-items: center;
     background: #004C5E;
     color: #FFF;
     font-family: Rubik, sans-serif;
     justify-content: space-between;
  }
  .name-container > img {
      height: 40px;
      width: 40px;
      object-fit: cover;
      border-radius: 4px;
  }
  .name-text > div:nth-child(1) {
      font-weight: 300;
      font-size: 16px;
  }
  .name-text > div:nth-child(2) {
      font-weight: 600;
      font-size: 24px;
      line-height: 1;
      white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 193px;
  }
  .logo-container {
      position: absolute;
    top: 0;
    left: 0;
      font-weight: 300;
      font-size: 18px;
      color: #FFF;
      font-family: Rubik, sans-serif;
      
  }
    .logo-container > span {
        font-weight: 600;
    }

.politician {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    min-width: 270px;
}
    
    .politician > .image {
        height: 130px;
    width: 100%;
    background-size: cover;
    background-position: center;
    }
</style>
<div class="container">
  <div class="content-container">
    <div class="logo-container">
        #Podsumowanie<span>Tygodnia</span>
    </div><img src="https://fra1.digitaloceanspaces.com/mypolitics-cdn/mypolitics-3/public/assets/logotype3.png">
    {{#each politicians}}
      <div class="politician">
        <div class="image" style="
        background-image: url(&quot;{{image.url}}&quot;);
    "></div>
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
    {{/each}}
</div>
</div> 
</div>
`