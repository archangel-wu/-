/* 
 * 贪吃蛇游戏 - 初学者详细注释版
 * 这个文件包含了贪吃蛇游戏的所有核心逻辑和功能实现
 * 代码结构清晰，每个函数都有详细的注释说明
 */

// 游戏配置对象 - 可以调整这些值来改变游戏行为
const config = {
    gridSize: 20,          // 每个格子的大小（像素）
    initialSpeed: 150,     // 游戏初始速度（毫秒）- 数值越小游戏越快
    speedIncrease: 5,      // 每次得分后速度增加的毫秒数
    maxSpeed: 50           // 游戏最大速度（最小延迟）
};

// 游戏状态对象 - 存储游戏的所有动态数据
let gameState = {
    snake: [],           // 蛇的身体部分，每个元素是一个{x,y}坐标对象
    food: {},            // 食物的位置，一个{x,y}坐标对象
    direction: 'right',  // 当前蛇移动的方向
    nextDirection: 'right', // 下次移动的方向（用于处理快速按键）
    score: 0,            // 当前分数
    highScore: 0,        // 最高分数
    gameActive: false,   // 游戏是否正在进行
    gameLoop: null,      // 游戏循环的定时器ID
    speed: config.initialSpeed // 当前游戏速度
};

// 获取DOM元素 - 用于与页面交互
const canvas = document.getElementById('game-board'); // 游戏画布元素
const ctx = canvas.getContext('2d'); // 画布上下文，用于绘制游戏画面
const scoreElement = document.getElementById('score'); // 显示分数的元素
const highScoreElement = document.getElementById('high-score'); // 显示最高分的元素
const startButton = document.getElementById('start-btn'); // 开始按钮
const pauseButton = document.getElementById('pause-btn'); // 暂停按钮
const resetButton = document.getElementById('reset-btn'); // 重置按钮
const directionButtons = document.querySelectorAll('.direction-btn'); // 方向控制按钮

/**
 * 初始化游戏函数
 * 这个函数在页面加载时执行，设置游戏的初始状态
 */
function initGame() {
    // 从localStorage加载最高分 - localStorage是浏览器的本地存储功能
    // 如果没有存储过高分，默认为0
    gameState.highScore = localStorage.getItem('snakeHighScore') || 0;
    // 更新页面上显示的最高分
    highScoreElement.textContent = gameState.highScore;
    
    // 设置画布大小 - 创建一个20x20的网格
    canvas.width = config.gridSize * 20;
    canvas.height = config.gridSize * 20;
    
    // 初始化事件监听器 - 设置键盘、按钮、触摸等交互
    setupEventListeners();
    
    // 初始化游戏板 - 设置蛇的初始位置、食物等
    resetGame();
    // 绘制初始游戏画面
    drawGame();
}

/**
 * 设置事件监听器函数
 * 这个函数为各种用户交互（键盘、按钮点击、触摸等）添加事件监听
 * 让玩家能够通过多种方式控制游戏
 */
function setupEventListeners() {
    // 键盘控制 - 监听整个文档的键盘按下事件
    // 当玩家按下键盘上的键时，调用handleKeyDown函数处理
    document.addEventListener('keydown', handleKeyDown);
    
    // 按钮控制 - 为游戏控制按钮添加点击事件
    startButton.addEventListener('click', startGame);       // 开始按钮点击时启动游戏
    pauseButton.addEventListener('click', togglePause);     // 暂停按钮点击时暂停/继续游戏
    resetButton.addEventListener('click', resetGame);       // 重置按钮点击时重置游戏
    
    // 方向按钮控制 - 为屏幕上的方向按钮添加点击事件
    directionButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 从按钮的data-direction属性获取方向值（up/down/left/right）
            const newDirection = button.dataset.direction;
            // 调用changeDirection函数改变蛇的移动方向
            changeDirection(newDirection);
        });
    });
    
    // 触摸滑动控制（移动设备）
    // 这部分代码实现了触摸屏设备上的滑动控制功能
    let touchStartX = 0; // 存储触摸开始时的X坐标
    let touchStartY = 0; // 存储触摸开始时的Y坐标
    
    // 触摸开始事件 - 当玩家触摸屏幕时触发
    canvas.addEventListener('touchstart', (e) => {
        // 记录初始触摸位置
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        // 阻止默认行为，避免页面滚动
        e.preventDefault();
    }, { passive: false });
    
    // 触摸移动事件 - 当玩家在屏幕上滑动时触发
    canvas.addEventListener('touchmove', (e) => {
        // 阻止页面滚动
        e.preventDefault();
    }, { passive: false });
    
    // 触摸结束事件 - 当玩家结束触摸时触发
    canvas.addEventListener('touchend', (e) => {
        // 如果游戏未开始，不做任何操作
        if (!gameState.gameActive) return;
        
        // 获取触摸结束时的坐标
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        // 计算滑动距离
        const diffX = touchEndX - touchStartX; // X轴滑动距离
        const diffY = touchEndY - touchStartY; // Y轴滑动距离
        
        // 判断滑动方向 - 通过比较X和Y轴的滑动距离绝对值
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动（X轴滑动距离更大）
            if (diffX > 0) {
                // 向右滑动
                changeDirection('right');
            } else {
                // 向左滑动
                changeDirection('left');
            }
        } else {
            // 垂直滑动（Y轴滑动距离更大或相等）
            if (diffY > 0) {
                // 向下滑动
                changeDirection('down');
            } else {
                // 向上滑动
                changeDirection('up');
            }
        }
        
        // 阻止默认行为
        e.preventDefault();
    }, { passive: false });
}

/**
 * 重置游戏函数
 * 将游戏状态恢复到初始状态，准备开始新游戏
 * 这个函数会重置蛇的位置、分数、速度等所有游戏相关数据
 */
function resetGame() {
    // 停止当前游戏循环 - 清除之前的定时器，防止多个游戏循环同时运行
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
    }
    
    // 重置游戏状态
    // 初始化蛇的位置 - 创建一个包含3个坐标点的数组，表示蛇的初始长度
    gameState.snake = [
        { x: 10, y: 10 }, // 蛇头位置
        { x: 9, y: 10 },  // 第一节身体
        { x: 8, y: 10 }   // 第二节身体
    ];
    gameState.direction = 'right';      // 初始移动方向为向右
    gameState.nextDirection = 'right';  // 下次移动方向也设为向右
    gameState.score = 0;               // 分数重置为0
    gameState.speed = config.initialSpeed; // 游戏速度重置为初始值
    gameState.gameActive = false;      // 游戏状态设置为未开始
    
    // 更新分数显示 - 将页面上的分数文本更新为当前分数
    scoreElement.textContent = gameState.score;
    
    // 生成食物 - 调用generateFood函数在随机位置生成新的食物
    generateFood();
    
    // 更新按钮状态 - 设置按钮的可用状态
    startButton.disabled = false;   // 启用开始按钮
    pauseButton.disabled = true;    // 禁用暂停按钮（因为游戏未开始）
    pauseButton.textContent = '暂停游戏'; // 重置暂停按钮的文本
    
    // 清除游戏结束样式
    canvas.style.borderColor = '#333';
    // 移除game-over类，确保没有额外的CSS样式影响
    canvas.classList.remove('game-over');
    
    // 绘制初始游戏画面
    drawGame();
}

/**
 * 开始游戏函数
 * 启动游戏循环并设置游戏为活动状态
 */
function startGame() {
    // 防止重复启动 - 如果游戏已经在进行中，不执行任何操作
    if (gameState.gameActive) return;
    
    // 确保没有任何残留的游戏循环
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null;
    }
    
    // 设置游戏状态为活动状态
    gameState.gameActive = true;
    
    // 更新按钮状态
    startButton.disabled = true;   // 禁用开始按钮，防止重复点击
    pauseButton.disabled = false;  // 启用暂停按钮
    pauseButton.textContent = '暂停游戏'; // 确保暂停按钮文本正确
    
    // 移除任何可能存在的game-over类
    canvas.classList.remove('game-over');
    canvas.style.borderColor = '#333'; // 恢复默认边框颜色
    
    // 启动游戏循环 - 使用setInterval定时执行gameUpdate函数
    // gameState.speed控制游戏速度，单位是毫秒
    gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
}

/**
 * 暂停/继续游戏函数
 * 切换游戏的暂停状态
 */
function togglePause() {
    // 判断是否是从暂停状态继续游戏
    if (!gameState.gameActive && pauseButton.textContent === '继续游戏') {
        // 确保没有活跃的游戏循环
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = null;
        }
        
        // 继续游戏
        gameState.gameActive = true;          // 设置游戏状态为活动
        pauseButton.textContent = '暂停游戏'; // 更改按钮文本
        // 重新启动游戏循环
        gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
        // 恢复画布边框颜色
        canvas.style.borderColor = '#333';
    } else if (gameState.gameActive) {
        // 暂停游戏
        gameState.gameActive = false;         // 设置游戏状态为非活动
        // 安全地清除游戏循环
        if (gameState.gameLoop) {
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = null;
        }
        pauseButton.textContent = '继续游戏'; // 更改按钮文本为继续
        // 更改画布边框颜色为橙色，表示暂停状态
        canvas.style.borderColor = '#ff9800';
    }
}

/**
 * 处理键盘事件函数
 * 响应玩家的键盘输入，控制游戏和蛇的移动
 */
function handleKeyDown(e) {
    // 如果游戏未开始且按下的不是空格或回车键，则忽略输入
    // 这样设计可以让玩家在游戏未开始时也能用空格或回车启动游戏
    if (!gameState.gameActive && e.key !== ' ' && e.key !== 'Enter') return;
    
    // 根据按下的键执行相应操作
    switch (e.key) {
        // 向上移动 - 支持方向键上和W键
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection('up');
            break;
        // 向下移动 - 支持方向键下和S键
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection('down');
            break;
        // 向左移动 - 支持方向键左和A键
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection('left');
            break;
        // 向右移动 - 支持方向键右和D键
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection('right');
            break;
        // 空格或空格键 - 开始/暂停游戏
        case ' ':
        case 'Spacebar':
            if (gameState.gameActive) {
                togglePause();  // 如果游戏进行中，暂停游戏
            } else {
                startGame();    // 如果游戏未开始，启动游戏
            }
            break;
        // R键 - 重置游戏
        case 'r':
        case 'R':
            resetGame();
            break;
    }
}

/**
 * 改变蛇的移动方向函数
 * 这个函数确保蛇不能直接反向移动（180度转向）
 * @param {string} newDirection - 新的移动方向（'up', 'down', 'left', 'right'）
 */
function changeDirection(newDirection) {
    // 定义相反方向的映射，用于防止180度转向
    const oppositeDirections = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    // 检查新方向是否与当前方向相反
    // 如果不是相反方向，则更新下次移动的方向
    if (newDirection !== oppositeDirections[gameState.direction]) {
        gameState.nextDirection = newDirection;
    }
}

/**
 * 生成食物函数
 * 在游戏区域内随机生成食物，并确保食物不会出现在蛇的身体上
 */
function generateFood() {
    let newFood; // 存储新食物的位置
    
    // 使用do-while循环确保食物不会出现在蛇身上
    do {
        // 生成随机位置
        // Math.random() 生成0到1之间的随机数
        // Math.floor() 向下取整
        // canvas.width / config.gridSize 计算水平方向的格子数量
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / config.gridSize)),
            y: Math.floor(Math.random() * (canvas.height / config.gridSize))
        };
    // 检查生成的食物位置是否与蛇的任何身体部分重合
    // some()方法只要有一个元素满足条件就返回true
    } while (gameState.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    // 将生成的食物位置保存到游戏状态中
    gameState.food = newFood;
}

/**
 * 游戏更新函数
 * 这是游戏的核心函数，每帧都会执行，处理蛇的移动、碰撞检测、吃食物等逻辑
 */
function gameUpdate() {
    // 安全检查：如果游戏已不处于活动状态，立即退出函数
    // 这可以防止在gameOver后仍有残留的定时器触发更新
    if (!gameState.gameActive) {
        return;
    }
    
    // 更新方向 - 使用之前存储的nextDirection作为当前方向
    // 这样可以处理快速连续按键的情况
    gameState.direction = gameState.nextDirection;
    
    // 获取蛇头位置 - 创建一个新对象，复制当前蛇头的坐标
    // 使用展开运算符(...)复制对象，避免直接引用
    const head = { ...gameState.snake[0] };
    
    // 根据方向移动蛇头 - 每次移动一个格子
    switch (gameState.direction) {
        case 'up':
            head.y--; // 向上移动，y坐标减1
            break;
        case 'down':
            head.y++; // 向下移动，y坐标加1
            break;
        case 'left':
            head.x--; // 向左移动，x坐标减1
            break;
        case 'right':
            head.x++; // 向右移动，x坐标加1
            break;
    }
    
    // 检查是否碰撞墙壁 - 判断蛇头是否超出游戏区域边界
    if (head.x < 0 || head.x >= canvas.width / config.gridSize || 
        head.y < 0 || head.y >= canvas.height / config.gridSize) {
        // 立即调用gameOver
        gameOver();
        // 确保函数立即退出，防止执行任何后续绘制操作
        return;
    }
    
    // 检查是否碰撞自身 - 判断蛇头是否与身体的任何部分重合
    if (gameState.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        // 立即调用gameOver
        gameOver();
        // 确保函数立即退出，防止执行任何后续绘制操作
        return;
    }
    
    // 将新头部添加到蛇身体的最前面
    // unshift()方法在数组开头添加元素
    gameState.snake.unshift(head);
    
    // 检查是否吃到食物 - 判断蛇头是否与食物位置重合
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // 吃到食物了！
        
        // 增加分数 - 每次吃到食物加10分
        gameState.score += 10;
        // 更新页面上显示的分数
        scoreElement.textContent = gameState.score;
        
        // 更新最高分
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            highScoreElement.textContent = gameState.highScore;
            // 将最高分保存到localStorage，这样刷新页面后最高分不会丢失
            localStorage.setItem('snakeHighScore', gameState.highScore);
        }
        
        // 生成新食物
        generateFood();
        
        // 增加游戏速度 - 让游戏随着分数增加变得更有挑战性
        if (gameState.speed > config.maxSpeed) { // 确保速度不会超过最大限制
            gameState.speed -= config.speedIncrease; // 减少延迟，提高速度
            // 重新设置游戏循环，使用新的速度
            clearInterval(gameState.gameLoop);
            gameState.gameLoop = setInterval(gameUpdate, gameState.speed);
        }
    } else {
        // 如果没吃到食物，移除蛇的尾部，保持蛇的长度不变
        // pop()方法移除数组的最后一个元素
        gameState.snake.pop();
    }
    
    // 绘制游戏画面 - 更新游戏显示
    drawGame();
}

/**
 * 游戏结束函数
 * 处理游戏结束时的所有逻辑，包括停止游戏循环、更新游戏状态、
 * 添加视觉效果和显示游戏结束界面
 */
function gameOver() {
    // 防止重复调用导致的闪烁问题
    if (!gameState.gameActive) return;
    
    // 立即设置游戏状态为非活动（尽早设置，防止后续调用）
    gameState.gameActive = false;
    
    // 安全地停止游戏循环 - 确保清除任何可能的定时器
    if (gameState.gameLoop) {
        clearInterval(gameState.gameLoop);
        gameState.gameLoop = null; // 显式设置为null，避免引用问题
    }
    
    // 更新按钮状态 - 允许用户重新开始游戏
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = '暂停游戏'; // 重置暂停按钮文本
    
    // 添加游戏结束视觉效果 - 改变画布边框颜色为红色
    canvas.style.borderColor = '#f44336';
    // 添加game-over类，可用于应用额外的CSS样式
    canvas.classList.add('game-over');
    
    // 使用setTimeout确保在DOM更新完成后执行，避免闪烁问题
    // 使用requestAnimationFrame确保在下一帧绘制游戏结束画面
    setTimeout(() => {
        requestAnimationFrame(() => {
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 显示游戏结束信息
            // 绘制半透明黑色遮罩
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制"游戏结束"标题
            ctx.fillStyle = '#f44336'; // 使用红色文字
            ctx.font = 'bold 30px Arial'; // 使用粗体大字体
            ctx.textAlign = 'center'; // 设置文字居中
            ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
            
            // 绘制最终得分和重新开始提示
            ctx.fillStyle = 'white'; // 使用白色文字
            ctx.font = '20px Arial'; // 使用普通大小字体
            ctx.fillText(`最终得分: ${gameState.score}`, canvas.width / 2, canvas.height / 2 + 20);
            ctx.fillText('按空格键或点击开始按钮重新开始', canvas.width / 2, canvas.height / 2 + 60);
        });
    }, 0);
}

/**
 * 绘制游戏画面函数
 * 负责在canvas上绘制游戏的所有元素，包括网格、蛇和食物
 * 这个函数会在每一帧被调用，更新游戏的视觉显示
 */
function drawGame() {
    // 清除画布 - 在绘制新的一帧之前，先清除之前的所有绘制内容
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）- 为游戏区域绘制背景网格线，增强视觉效果
    drawGrid();
    
    // 绘制蛇 - 调用专门的drawSnake函数来绘制蛇的头部和身体
    drawSnake();
    
    // 绘制食物 - 调用专门的drawFood函数来绘制食物
    drawFood();
}

/**
 * 绘制网格函数
 * 在游戏区域内绘制背景网格线，帮助玩家更好地判断位置和距离
 * 使用半透明细线，不会干扰游戏主体
 */
function drawGrid() {
    // 设置网格线颜色为半透明白色，增加视觉层次感但不突兀
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1; // 设置网格线宽度
    
    // 绘制垂直线 - 从左到右，每隔一个格子宽度绘制一条垂直线
    for (let x = 0; x <= canvas.width; x += config.gridSize) {
        ctx.beginPath(); // 开始一条新路径
        ctx.moveTo(x, 0); // 移动到起始点（顶部边缘）
        ctx.lineTo(x, canvas.height); // 绘制到终点（底部边缘）
        ctx.stroke(); // 执行绘制
    }
    
    // 绘制水平线 - 从上到下，每隔一个格子宽度绘制一条水平线
    for (let y = 0; y <= canvas.height; y += config.gridSize) {
        ctx.beginPath(); // 开始一条新路径
        ctx.moveTo(0, y); // 移动到起始点（左侧边缘）
        ctx.lineTo(canvas.width, y); // 绘制到终点（右侧边缘）
        ctx.stroke(); // 执行绘制
    }
}

/**
 * 绘制蛇函数
 * 负责绘制蛇的所有部分，包括头部和身体
 * 使用不同的样式区分头部和身体，并为头部添加眼睛
 */
function drawSnake() {
    // 使用forEach遍历蛇的每个部分
    // segment是当前的蛇身体部分，index是其索引
    gameState.snake.forEach((segment, index) => {
        // 根据是否为头部设置不同的样式
        if (index === 0) {
            // 蛇头样式 - 使用深绿色并添加阴影效果
            ctx.fillStyle = '#4CAF50'; // 蛇头颜色
            ctx.shadowColor = '#2E7D32'; // 阴影颜色
            ctx.shadowBlur = 10; // 阴影模糊程度
        } else {
            // 蛇身体样式 - 使用渐变颜色
            // 使用取模运算符创建颜色循环效果
            const colorIndex = index % 3;
            // 定义身体颜色数组，创建渐变效果
            const colors = ['#8BC34A', '#CDDC39', '#4CAF50'];
            ctx.fillStyle = colors[colorIndex]; // 应用循环颜色
            ctx.shadowBlur = 0; // 身体部分不需要阴影
        }
        
        // 绘制蛇的身体部分
        ctx.fillRect(
            segment.x * config.gridSize, // x坐标
            segment.y * config.gridSize, // y坐标
            config.gridSize - 2, // 宽度（留出2px的间隙）
            config.gridSize - 2 // 高度（留出2px的间隙）
        );
        
        // 如果是头部，调用专门的函数绘制眼睛
        if (index === 0) {
            drawEyes(segment); // 传入头部位置作为参数
        }
    });
    
    // 重置阴影效果，避免影响后续绘制
    ctx.shadowBlur = 0;
}

/**
 * 绘制蛇的眼睛函数
 * 根据蛇的移动方向绘制不同位置的眼睛，使蛇看起来总是朝向移动方向
 * 每个眼睛由一个白色眼球和一个黑色瞳孔组成
 * 
 * @param {Object} head - 蛇头的位置对象，包含x和y坐标
 */
function drawEyes(head) {
    // 绘制白色眼球
    ctx.fillStyle = 'white'; // 设置眼球颜色为白色
    // 计算眼睛大小，基于格子大小的1/5
    const eyeSize = config.gridSize / 5;
    // 计算眼睛与头部边缘的偏移量，基于格子大小的1/4
    const eyeOffset = config.gridSize / 4;
    
    // 根据蛇的移动方向确定眼睛位置
    switch (gameState.direction) {
        case 'up':
            // 向上移动时，眼睛在头部上方两侧
            ctx.beginPath();
            // 左眼 - 左上角
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            // 右眼 - 右上角
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill(); // 填充眼睛
            break;
        case 'down':
            // 向下移动时，眼睛在头部下方两侧
            ctx.beginPath();
            // 左眼 - 左下角
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            // 右眼 - 右下角
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill(); // 填充眼睛
            break;
        case 'left':
            // 向左移动时，眼睛在头部左侧上下
            ctx.beginPath();
            // 左眼 - 左上角
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            // 右眼 - 左下角
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill(); // 填充眼睛
            break;
        case 'right':
            // 向右移动时，眼睛在头部右侧上下
            ctx.beginPath();
            // 左眼 - 右上角
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            // 右眼 - 右下角
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                eyeSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill(); // 填充眼睛
            break;
    }
    
    // 绘制黑色瞳孔 - 瞳孔会根据移动方向朝向相应方向
    ctx.fillStyle = 'black'; // 设置瞳孔颜色为黑色
    const pupilSize = eyeSize / 2; // 瞳孔大小为眼球的一半
    
    // 根据移动方向设置瞳孔位置
    switch (gameState.direction) {
        case 'up':
            // 瞳孔向上看
            ctx.beginPath();
            // 左眼瞳孔向上偏移2像素
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + eyeOffset - 2, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            // 右眼瞳孔向上偏移2像素
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + eyeOffset - 2, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            break;
        case 'down':
            // 瞳孔向下看
            ctx.beginPath();
            // 左眼瞳孔向下偏移2像素
            ctx.arc(
                head.x * config.gridSize + eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset + 2, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            // 右眼瞳孔向下偏移2像素
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset, 
                head.y * config.gridSize + config.gridSize - eyeOffset + 2, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            break;
        case 'left':
            // 瞳孔向左看
            ctx.beginPath();
            // 左眼瞳孔向左偏移2像素
            ctx.arc(
                head.x * config.gridSize + eyeOffset - 2, 
                head.y * config.gridSize + eyeOffset, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            // 右眼瞳孔向左偏移2像素
            ctx.arc(
                head.x * config.gridSize + eyeOffset - 2, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            break;
        case 'right':
            // 瞳孔向右看
            ctx.beginPath();
            // 左眼瞳孔向右偏移2像素
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset + 2, 
                head.y * config.gridSize + eyeOffset, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            // 右眼瞳孔向右偏移2像素
            ctx.arc(
                head.x * config.gridSize + config.gridSize - eyeOffset + 2, 
                head.y * config.gridSize + config.gridSize - eyeOffset, 
                pupilSize, 
                0, 
                Math.PI * 2
            );
            ctx.fill();
            break;
    }
}

/**
 * 绘制食物函数
 * 以圆形形式绘制食物，添加阴影和光泽效果使其看起来更有吸引力
 * 食物使用红色并添加高光效果，使其在视觉上更突出
 */
function drawFood() {
    // 设置食物主体样式
    ctx.fillStyle = '#ff6b6b'; // 设置食物颜色为粉红色
    ctx.shadowColor = '#ee5253'; // 设置阴影颜色为深红色
    ctx.shadowBlur = 10; // 设置阴影模糊程度，增加立体感
    
    // 绘制圆形食物主体
    ctx.beginPath();
    ctx.arc(
        // 圆心x坐标 = 食物位置x * 格子大小 + 格子大小/2（使圆心在格子中心）
        gameState.food.x * config.gridSize + config.gridSize / 2,
        // 圆心y坐标 = 食物位置y * 格子大小 + 格子大小/2（使圆心在格子中心）
        gameState.food.y * config.gridSize + config.gridSize / 2,
        // 半径 = 格子大小/2 - 2（稍小于格子半径，留出边框）
        config.gridSize / 2 - 2,
        0, // 起始角度（弧度）
        Math.PI * 2 // 结束角度（弧度），2π表示一个完整的圆
    );
    ctx.fill(); // 填充圆形
    
    // 绘制食物的光泽效果，增加视觉吸引力
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'; // 使用半透明白色作为高光
    ctx.beginPath();
    ctx.arc(
        // 高光位置稍偏向食物的左上方
        gameState.food.x * config.gridSize + config.gridSize / 2 - 3,
        gameState.food.y * config.gridSize + config.gridSize / 2 - 3,
        config.gridSize / 6, // 高光大小为格子大小的1/6
        0, 
        Math.PI * 2
    );
    ctx.fill(); // 填充高光
    
    // 重置阴影效果，避免影响后续绘制
    ctx.shadowBlur = 0;
}

/**
 * 当页面加载完成后初始化游戏
 * 使用window.addEventListener监听load事件，确保DOM元素和资源都已加载完毕
 * 这样可以避免在DOM元素未完全加载时尝试访问它们而导致错误
 */
window.addEventListener('load', initGame);