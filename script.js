
  window.onload = function() {
  document.addEventListener('keydown', changeDirection);
  setInterval(loop, 1000/60); // 60 FPS
}

let
  canv 			    	= document.getElementById('mc'), // canvas
  ctx			    	= canv.getContext('2d'), // 2d context
  gs = fkp			    = false, // старт игры && первое нажатие клавиши 
  speed = baseSpeed 	= 3, // скорость движения змеи
  xv = yv				= 0, //скорость (x & y)
  px 					= ~~(canv.width) / 2, // координаты X 
  py 					= ~~(canv.height) / 2, // координаты Y 
  pw = ph				= 20, // размер элемента змеи
  aw = ah				= 20, // размер точки (яблока)
  apples				= [], // несколько яблок
  parttail				= [], // часть хвоста 
  tail 				    = 100, // хвост (1 for 10)
  protectionTail		= 20, // защита от поедание змеей себя
  rechargeKey			= false, //ключ перезарядки
  score		    		= 0; // счет

// основной цикл игры
function loop()
{
  // логика
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canv.width, canv.height);

  // усиление скорости
  px += xv;
  py += yv;

  // телепорт
  if( px > canv.width )
    {px = 0;}

  if( px + pw < 0 )
    {px = canv.width;}

  if( py + ph < 0 )
    {py = canv.height;}

  if( py > canv.height )
    {py = 0;}

  // раскраска змеи и ее частей
  ctx.fillStyle = 'green';
  for( let i = 0; i < parttail.length; i++ )
  {
    ctx.fillStyle = parttail[i].color || 'geen';
    ctx.fillRect(parttail[i].x, parttail[i].y, pw, ph);
  }

  parttail.push({x: px, y: py, color: ctx.fillStyle});

  // ограничение змеи
  if( parttail.length > tail )
  {
    parttail.shift();
  }

  // поедание
  if( parttail.length > tail )
  {
    parttail.shift();
  }

  // пересечение туловища
  if( parttail.length >= tail && gs )
  {
    for( let i = parttail.length - protectionTail; i >= 0; i-- )
    {
      if(
        px < (parttail[i].x + pw)
        && px + pw > parttail[i].x
        && py < (parttail[i].y + ph)
        && py + ph > parttail[i].y
      )
      {
        // произвшло пересечение
        tail = 10; // уменьшение хвоста
        speed = baseSpeed; // уменьшение скорости

        for( let t = 0; t < parttail.length; t++ )
        {
          // выделение области потери (пересечения) туловища
          parttail[t].color = 'red';

          if( t >= parttail.length - tail )
            {break;}
        }
      }
    }
  }

  // раскрашиваем точки
  for( let a = 0; a < apples.length; a++ )
  {
    ctx.fillStyle = apples[a].color;
    ctx.fillRect(apples[a].x, apples[a].y, aw, ah);
  }

  // проверка на пересечения яблока со змеей
  for( let a = 0; a < apples.length; a++ )
  {
    if(
      px < (apples[a].x + pw)
      && px + pw > apples[a].x
      && py < (apples[a].y + ph)
      && py + ph > apples[a].y
    )
    {
      // столкновение змеи с точкой
      apples.splice(a, 1); // удаление точки
      tail += 10; // увеличение длины хвоста
      speed += .1; // увеличение скорости
      spawnApple(); // создание еще яблока
      break;
    }
  }
}

// появление точек (яблок)
function spawnApple()
{
  let
    newApple = {
      x: ~~(Math.random() * canv.width),
      y: ~~(Math.random() * canv.height),
      color: '#'+(0x1000000+Math.random()*0xFFFFFF).toString(16).substr(1,6)
    };

  // запрет появляться близко к краям
  if(
    (newApple.x < aw || newApple.x > canv.width - aw)
    ||
    (newApple.y < ah || newApple.y > canv.height - ah)
  )
  {
    spawnApple();
    return;
  }

  // проверка на столкновение со змеей
  for( let i = 0; i < tail.length; i++ )
  {
    if(
      newApple.x < (parttail[i].x + pw)
      && newApple.x + aw > parttail[i].x
      && newApple.y < (parttail[i].y + ph)
      && newApple.y + ah > parttail[i].y
    )
    {
      // столкновение
      spawnApple();
      return;
    }
  }

  apples.push(newApple);

  if( apples.length < 3 && ~~(Math.random() * 1000) > 700 )
  {
    // 30% шанс создать еще одну точку
    spawnApple();
  }
}

// генератор случайных цветов 
function rc()
{
  return '#' + ((~~(Math.random() * 255)).toString(16)) + ((~~(Math.random() * 255)).toString(16)) + 
  ((~~(Math.random() * 255)).toString(16));
  
}

// регулятор скорости
function changeDirection(evt)
{
  if( !fkp && [37,38,39,40].indexOf(evt.keyCode) > -1 )
  {
    setTimeout(function() {gs = true;}, 1000);
    fkp = true;
    spawnApple();
  }

  if( rechargeKey )
    {return false;}

  /*
    4 направления движения.
   */
  if( evt.keyCode == 37 && !(xv > 0) ) // стрелка влево
    {xv = -speed; yv = 0;}

  if( evt.keyCode == 38 && !(yv > 0) ) // стрелка вверх
    {xv = 0; yv = -speed;}

  if( evt.keyCode == 39 && !(xv < 0) ) // стрелка вправо
    {xv = speed; yv = 0;}

  if( evt.keyCode == 40 && !(yv < 0) ) // стрелка вниз
    {xv = 0; yv = speed;}

    rechargeKey = true;
  setTimeout(function() {rechargeKey = false;}, 100);
}
