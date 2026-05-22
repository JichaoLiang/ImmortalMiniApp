/**
 * 播放视频并在最后一帧自动暂停
 * @param {string} videoId - video组件的id
 * @param {Object} pageInstance - 当前页面的this实例
 * @param {Function} onPausedAtEnd - 暂停后的回调函数
 * @returns {Object} 返回videoContext，方便外部控制
 */
export function playVideoAndPauseAtEnd(videoId, pageInstance, onPausedAtEnd) {
  // 获取video上下文
  const videoContext = wx.createVideoContext(videoId, pageInstance);
  
  // 监听视频播放进度
  const onTimeUpdate = (e: any) => {
    const currentTime = e.detail.currentTime;
    const duration = pageInstance.data[videoId + 'Duration']; // 从data中读取总时长
    
    // 如果当前播放时间已经到达或超过最后0.1秒
    if (duration && currentTime >= duration - 0.1) {
      // 暂停视频
      videoContext.pause();
      
      // 确保定格在最后一帧（微调位置）
      setTimeout(() => {
        videoContext.seek(duration);
      }, 10);
      
      // 移除时间监听，避免重复触发
      videoContext.offTimeUpdate(onTimeUpdate);
      
      // 执行回调函数
      if (typeof onPausedAtEnd === 'function') {
        onPausedAtEnd();
      }
    }
  };
  
  // 监听视频元数据加载完成，获取总时长
  const onLoadedMetadata = (e) => {
    const duration = e.detail.duration;
    // 将时长存储到pageInstance的data中
    pageInstance.setData({
      [videoId + 'Duration']: duration
    });
    
    // 开始播放视频
    videoContext.play();
    
    // 开始监听播放进度
    videoContext.onTimeUpdate(onTimeUpdate);
  };
  
  // 绑定元数据加载事件
  videoContext.onLoadedMetadata(onLoadedMetadata);
  
  // 返回videoContext，方便外部调用
  return videoContext;
}

 // 播放视频并监听进度
 export const playVideoThenCallback = (src:string, page: any, callback: any) => {
  // 重置所有状态
  page.setData({ 
    videoSrc: src,
    videoDuration: 0,
    isVideoEnded: false 
  });
  page.pauseCallback = callback;
}