let queue: any = []
let isFlushPending = false
export function queueJobs(job) {
  if(!queue.includes(job)){
    queue.push(job)
  }
  
  quereFlush()
}

function quereFlush() {
  if(isFlushPending) return;
  isFlushPending = true
  Promise.resolve().then(() => {
    isFlushPending = false
    let job;
    while (job = queue.shift()) {
      job && job()
    }
  })
}