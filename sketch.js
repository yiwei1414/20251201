let stopSheet;
let walkSheet;
let jumpSheet;

let stopFrameWidth = 355 / 6;  // stop 精靈圖每一幀的寬度
let stopFrameHeight = 87;

let walkFrameWidth = 619 / 6;  // walk 精靈圖每一幀的寬度
let walkFrameHeight = 88;

let jumpFrameWidth = 289 / 6;  // jump 精靈圖每一幀的寬度
let jumpFrameHeight = 101;

let characterX = 0;  // 角色水平位置
let characterY = 0;  // 角色垂直位置
let groundY = 0;  // 地面位置（初始角色位置的Y軸）
let currentFrame = 0;
let animationSpeed = 5;  // 控制動畫速度

let isMoving = false;  // 是否正在移動
let isJumping = false;  // 是否正在跳躍
let jumpStartFrame = 0;  // 跳躍開始的幀數
let moveDirection = 1;  // 移動方向：1 為右，-1 為左
let moveSpeed = 3;  // 移動速度
let jumpHeight = 150;  // 最大跳躍高度
// attack / projectile
let attackSheet;
let attackFrameWidth = 994 / 9; // attack sprite 每幀寬度
let attackFrameHeight = 87;
let isAttacking = false;
let attackStartFrame = 0;
let attackFrameCount = 9;

let crazySheet;
let crazyFrameWidth = 503 / 4;
let crazyFrameHeight = 229;

let projectiles = []; // array of active spawned "crazy" characters

function preload() {
  stopSheet = loadImage('1/stop/stop_all.png');
  walkSheet = loadImage('1/walk/walk_all.png');
  jumpSheet = loadImage('1/jump/jump_all.png');
  attackSheet = loadImage('1/attack/attack_all.png');
  crazySheet = loadImage('1/crazy/crazy_all.png');
}

function setup() {
  // 創建全視窗畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化角色位置為畫布中心
  characterX = windowWidth / 2;
  characterY = windowHeight * 0.7;  // 角色位置在屏幕下方
  groundY = characterY;  // 記錄地面位置
}

function drawArena() {
  // 繪製日式風格道館背景
  
  // 天空背景（淡藍色）
  background(135, 206, 235);
  
  // 道館牆壁（土黃色）
  fill(210, 180, 140);
  noStroke();
  rect(0, 0, windowWidth, windowHeight * 0.35);
  
  // 木製天花板（深棕色）
  fill(139, 69, 19);
  rect(0, windowHeight * 0.35, windowWidth, 30);
  
  // 竹簾窗戶裝飾（上方左右兩側）
  fill(184, 134, 11);
  noStroke();
  rect(100, windowHeight * 0.1, 150, 80);
  rect(windowWidth - 250, windowHeight * 0.1, 150, 80);
  
  // 道館地面（淡色木質地板 - 榻榻米風格）
  fill(222, 184, 135);
  noStroke();
  rect(0, windowHeight * 0.38, windowWidth, windowHeight * 0.62);
  
  // 舞台區域（角色站立位置下方）
  let stageWidth = 600;
  let stageHeight = 120;
  let stageX = windowWidth / 2 - stageWidth / 2;
  let stageY = windowHeight * 0.7 + 60;
  
  // 舞台主體（深紅色）
  fill(139, 35, 35);
  rect(stageX, stageY, stageWidth, stageHeight);
  
  // 舞台邊框
  strokeWeight(4);
  stroke(184, 134, 11);
  noFill();
  rect(stageX, stageY, stageWidth, stageHeight);
  
  // 舞台邊框裝飾線
  stroke(218, 165, 32);
  strokeWeight(2);
  line(stageX, stageY + 15, stageX + stageWidth, stageY + 15);
  line(stageX, stageY + stageHeight - 15, stageX + stageWidth, stageY + stageHeight - 15);
  

  
  // 舞台角落裝飾（金色方塊）
  fill(218, 165, 32);
  rect(stageX - 15, stageY - 15, 30, 30);
  rect(stageX + stageWidth - 15, stageY - 15, 30, 30);
  rect(stageX - 15, stageY + stageHeight - 15, 30, 30);
  rect(stageX + stageWidth - 15, stageY + stageHeight - 15, 30, 30);
  

  
  // 道館邊界（深色木製邊框）
  strokeWeight(8);
  stroke(101, 67, 33);
  noFill();
  rect(20, windowHeight * 0.38, windowWidth - 40, windowHeight * 0.6);
  
  // 左側支柱
  fill(139, 69, 19);
  rect(10, windowHeight * 0.35, 25, windowHeight * 0.65);
  
  // 右側支柱
  rect(windowWidth - 35, windowHeight * 0.35, 25, windowHeight * 0.65);
  
  // 道館標誌（上方中央 - 日式圓形）
  fill(220, 20, 60);
  noStroke();
  circle(windowWidth / 2, windowHeight * 0.15, 60);
  
  // 白色內圈
  fill(255, 255, 255);
  circle(windowWidth / 2, windowHeight * 0.15, 40);
  
  // 紅色內圈
  fill(220, 20, 60);
  circle(windowWidth / 2, windowHeight * 0.15, 20);
}

function draw() {
  // 繪製競技場背景
  drawArena();

  // --- 動畫幀處理（跳躍或停止/走路/攻擊） ---
  if (isAttacking) {
    // attack 使用自己的幀數計算
    currentFrame = floor((frameCount - attackStartFrame) / animationSpeed);
    if (currentFrame >= attackFrameCount) {
      // 攻擊播放完成 -> 生成投射角色
      isAttacking = false;
      currentFrame = 0;
      // spawn projectile
      let proj = {
        x: characterX + moveDirection * (attackFrameWidth / 2 + 20),
        y: characterY - attackFrameHeight / 4,
        dir: moveDirection,
        speed: 6,
        startFrame: frameCount,
        animSpeed: 6,
        frameCount: 4,
        width: crazyFrameWidth,
        height: crazyFrameHeight
      };
      projectiles.push(proj);
    } else {
      currentFrame = min(currentFrame, attackFrameCount - 1);
    }
  } else if (isJumping) {
    currentFrame = floor((frameCount - jumpStartFrame) / animationSpeed);

    // 根據當前幀計算垂直位置
    // 前3幀上升，後3幀下降
    if (currentFrame < 3) {
      // 上升階段
      characterY = groundY - (jumpHeight * (currentFrame / 3));
    } else if (currentFrame < 6) {
      // 下降階段
      characterY = groundY - (jumpHeight * (1 - (currentFrame - 3) / 3));
    } else {
      // 跳躍完成
      characterY = groundY;
      isJumping = false;
      currentFrame = 0;
    }

    currentFrame = min(currentFrame, 5);  // 確保不超過6幀
  } else {
    currentFrame = floor((frameCount / animationSpeed) % 6);
  }

  // 更新角色水平位置（移動不中斷跳躍時也可移動）
  if (isMoving && !isJumping) {
    characterX += moveSpeed * moveDirection;
  }
  // 邊界檢查
  characterX = constrain(characterX, 0, windowWidth);

  // 選擇當前使用的精靈圖和幀寬度（攻擊優先，其次跳躍、走路、停止）
  let spriteSheet;
  let frameWidth;
  let frameHeight;
  if (isAttacking) {
    spriteSheet = attackSheet;
    frameWidth = attackFrameWidth;
    frameHeight = attackFrameHeight;
  } else if (isJumping) {
    spriteSheet = jumpSheet;
    frameWidth = jumpFrameWidth;
    frameHeight = jumpFrameHeight;
  } else if (isMoving) {
    spriteSheet = walkSheet;
    frameWidth = walkFrameWidth;
    frameHeight = walkFrameHeight;
  } else {
    spriteSheet = stopSheet;
    frameWidth = stopFrameWidth;
    frameHeight = stopFrameHeight;
  }

  // 計算要繪製的源圖片區域
  let srcX = currentFrame * frameWidth;
  let srcY = 0;

  // 根據方向決定是否水平翻轉並繪製角色
  push();
  translate(characterX, characterY);
  if (moveDirection === -1) {
    scale(-1, 1);
  }
  image(spriteSheet, -frameWidth / 2, -frameHeight / 2, frameWidth, frameHeight, srcX, srcY, frameWidth, frameHeight);
  pop();

  // --- 更新並繪製所有投射出的角色（projectiles） ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];

    // 移動
    p.x += p.speed * p.dir;

    // 計算動畫幀
    let pf = floor((frameCount - p.startFrame) / p.animSpeed) % p.frameCount;
    let pSrcX = pf * p.width;

    // 繪製
    push();
    translate(p.x, p.y);
    if (p.dir === -1) scale(-1, 1);
    image(crazySheet, -p.width / 2, -p.height / 2, p.width, p.height, pSrcX, 0, p.width, p.height);
    pop();

    // 移除超出畫面外的投射物
    if (p.x < -p.width || p.x > windowWidth + p.width) {
      projectiles.splice(i, 1);
    }
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isMoving = true;
    moveDirection = 1;
    return false;
  } else if (keyCode === LEFT_ARROW) {
    isMoving = true;
    moveDirection = -1;
    return false;
  } else if (keyCode === UP_ARROW) {
    if (!isJumping) {
      isJumping = true;
      jumpStartFrame = frameCount;
    }
    return false;
  } else if (keyCode === 32) { // 空白鍵攻擊
    if (!isAttacking) {
      isAttacking = true;
      attackStartFrame = frameCount;
    }
    return false;
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    isMoving = false;
    return false;
  }
}

// 當窗口大小改變時重新調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
