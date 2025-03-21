export function inkEffect() {
  const createInkEffect = (e: MouseEvent) => {
    // 使用pageX和pageY来获取相对于整个文档的坐标，这样可以考虑滚动
    const x = e.pageX;
    const y = e.pageY;
    
    // Create ink element
    const ink = document.createElement('div');
    // 添加fixed定位以修复滚动问题，并确保不影响其他元素
    ink.className = 'fixed rounded-full bg-ink-light pointer-events-none animate-ink-spread';
    ink.style.width = '80px';
    ink.style.height = '80px';
    ink.style.left = `${x - 40}px`;
    ink.style.top = `${y - 40}px`;
    // 降低z-index以确保它不会覆盖导航等重要元素
    ink.style.zIndex = '50';
    
    document.body.appendChild(ink);
    
    // Remove the ink element after animation
    setTimeout(() => {
      if (document.body.contains(ink)) {
        document.body.removeChild(ink);
      }
    }, 600);
  };
  
  window.addEventListener('click', createInkEffect);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('click', createInkEffect);
  };
}
