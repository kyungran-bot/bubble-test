// script.js
const container = document.getElementById('bubble-container');
// 전역 툴팁 관련 변수 없음

let bubbles = [];
let mouseX = -1000;
let mouseY = -1000;
// 줌 상태 변수 제거됨 (툴팁으로 교체)

const bubbleMemories = [
    { title: '캡슐세제', desc: '안녕 나는 캡슐세제에서 태어난 비눗방울이구...비눗방울 세계에 온 걸 환영해!!' },
    { title: '알칼리성 일반세제', desc: '안녕 나는 알칼리성 일반세제에서 태어난 비눗방울이며...계면활성제 10%와 알칼리제 50%, 효소 5%로 이루어져있어!' },
    { title: '섬유 보호용 중성세제', desc: '안녕 나는 중성 섬유보호 세제에서 비롯한 비눗방울이구...계면활성제 20%,섬유 보호제 10%,PH 완충제 5%,효소 5%,향료 10%,알 수 없는 것들 40%로 이루어져있어!' },
    { title: '가루세제', desc: '안녕 나는 가루세제에서 비롯한 비눗방울이며...탄산소다 30%,계면활성제 20%,효소 10%,향료 10%,내 사랑 30%로 이루어져있어!' },
    { title: '물때 제거용 산성세제', desc: '안녕 나는 물때 제거용 세제에서 온 비눗방울이며...계면활성제 10%,산성제 20%,효소 5%,향료 10%,내 꿈 55%로 이루어져있어!' }
];

function createBubble() {
    const isMemory = Math.random() > 0.65; // 약 35% 확률로 기억(감정) 비눗방울 생성
    const radius = isMemory ? Math.random() * 40 + 60 : Math.random() * 20 + 20; // 기억 방울은 더 크게(50~80), 일반 방울은 작게(20~40)

    let memory = null;
    if (isMemory) {
        memory = bubbleMemories[Math.floor(Math.random() * bubbleMemories.length)];
    }

    const b = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (window.innerWidth - radius * 2) + radius,
        y: Math.random() * (window.innerHeight - radius * 2) + radius,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        radius: radius,
        isMemory: isMemory,
        memory: memory,
        el: document.createElement('div')
    };

    let classNames = 'bubble';
    if (isMemory) classNames += ` memory`;
    b.el.className = classNames;

    b.el.style.width = (radius * 2) + 'px';
    b.el.style.height = (radius * 2) + 'px';
    b.el.dataset.id = b.id;

    if (isMemory) {
        const textSpan = document.createElement('span');
        // textSpan.innerText = b.emotion.name; // 글자 숨김
        b.el.appendChild(textSpan);
    }

    // 클릭 상호작용
    b.el.addEventListener('click', (e) => {
        if (b.isMemory) {
            showTooltip(b); // 출신 방울은 옆에 점선 말풍선 표시
        } else {
            popBubble(b); // 일반 방울은 터짐
        }
    });

    // css로 만들던 하이라이트는 없애고 bubble.png 배경으로 대체

    container.appendChild(b.el);
    return b;
}

// 초기 비눗방울 생성
const BUBBLE_COUNT = 30;
for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push(createBubble());
}

// 커서 추적 (마우스, 터치)
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});
document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
}, { passive: true });

// 팝 애니메이션 및 방울 소멸
function popBubble(b) {
    const pop = document.createElement('div');
    pop.className = 'pop-animation';
    pop.style.width = b.radius * 2 + 'px';
    pop.style.height = b.radius * 2 + 'px';
    pop.style.left = (b.x - b.radius) + 'px';
    pop.style.top = (b.y - b.radius) + 'px';
    container.appendChild(pop);

    setTimeout(() => {
        if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 400);

    if (b.el.parentNode) b.el.parentNode.removeChild(b.el);
    bubbles = bubbles.filter(bubble => bubble.id !== b.id);

    // 일정 시간 후 새 비눗방울 보충
    setTimeout(() => {
        bubbles.push(createBubble());
    }, 2000);
}

// 점선 말풍선 (Tooltip) 띄우기 (5초 뒤 자동 터짐)
function showTooltip(b) {
    if (b.hasTooltip) return;
    b.hasTooltip = true;

    const tooltip = document.createElement('div');
    tooltip.className = 'bubble-tooltip';

    // 비눗방울이 위쪽(Y축 250 미만)에 있으면 툴팁이 텍스트를 가리지 않게 아래로 나오게 처리
    if (b.y < 250) {
        tooltip.classList.add('tooltip-bottom');
    }

    tooltip.innerHTML = `<strong>${b.memory.title}</strong><br><span style="margin-top:5px; display:block; font-size:0.85em; font-weight:700; line-height: 1.4;">${b.memory.desc}</span>`;

    b.el.appendChild(tooltip);

    // 5초 후 말풍선 사라짐 + 비눗방울 터짐
    setTimeout(() => {
        if (tooltip.parentNode) {
            if (tooltip.classList.contains('tooltip-bottom')) {
                tooltip.style.animation = 'fadeOutBottom 0.3s ease forwards';
            } else {
                tooltip.style.animation = 'fadeOut 0.3s ease forwards';
            }
            setTimeout(() => {
                if (b.el.parentNode) popBubble(b);
            }, 300);
        }
    }, 5000);
}

window.addEventListener('resize', () => {
    // 리사이즈 시 방울이 화면 밖으로 나가지 않도록 조정
    bubbles.forEach(b => {
        if (b.x > window.innerWidth) b.x = window.innerWidth - b.radius;
        if (b.y > window.innerHeight) b.y = window.innerHeight - b.radius;
    });
});

// 메인 애니메이션 루프
function animate() {
    bubbles.forEach(b => {
        // Hover: 커서 접근 방지 로직 (밀어내기 힘 적용)
        const dx = b.x - mouseX;
        const dy = b.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 상호작용 반경 내에 들어왔을 때
        if (dist < 200) {
            const force = (200 - dist) / 200;
            b.vx += (dx / dist) * force * 0.8;
            b.vy += (dy / dist) * force * 0.8;
        }

        // 부유감: 약간의 무작위 속도 변화 추가
        b.vx += (Math.random() - 0.5) * 0.15;
        b.vy += (Math.random() - 0.5) * 0.15;

        // 저항 (Friction) 설정으로 무한 가속 방지
        b.vx *= 0.98;
        b.vy *= 0.98;

        // 최대 속도 제어
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > 5) {
            b.vx = (b.vx / speed) * 5;
            b.vy = (b.vy / speed) * 5;
        }

        b.x += b.vx;
        b.y += b.vy;

        // 화면 경계 튕김 (Bounce off walls)
        if (b.x - b.radius <= 0) {
            b.x = b.radius;
            b.vx *= -1;
        } else if (b.x + b.radius >= window.innerWidth) {
            b.x = window.innerWidth - b.radius;
            b.vx *= -1;
        }

        if (b.y - b.radius <= 0) {
            b.y = b.radius;
            b.vy *= -1;
        } else if (b.y + b.radius >= window.innerHeight) {
            b.y = window.innerHeight - b.radius;
            b.vy *= -1;
        }

        b.el.style.left = (b.x - b.radius) + 'px';
        b.el.style.top = (b.y - b.radius) + 'px';
    });

    requestAnimationFrame(animate);
}

// 애니메이션 시작
requestAnimationFrame(animate);
