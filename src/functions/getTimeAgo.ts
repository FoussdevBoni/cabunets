export  const getTimeAgo = (date?: string) => {
    const now = new Date();
    const pubDate = new Date(date||"");
    const diffSeconds = Math.floor((now.getTime() - pubDate.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} s`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} h`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} j`;
    return pubDate.toLocaleDateString();
  };