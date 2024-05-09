import cp from 'child_process'
import tk from 'tree-kill'
import si from 'systeminformation'
import config from './config.json'

type Processes = [string, number][]

async function listProcesses(): Promise<Processes> {
    const { list } = await si.processes()
    return list.map(x => [x.name, x.pid])
}

function matchExecutableNames(namesToMatch: string[], processes: Processes) {
    const matchingProcesses: Processes = []
    processes.forEach(([name, pid]) => {
        if (namesToMatch.includes(name)) matchingProcesses.push([name, pid])
    })
    return matchingProcesses
}

async function killOff(pids: number[]) {
    for (let i = 0; i < pids.length; i++) {
        const pid = pids[i]
        await new Promise<void>((resolve, reject) => {
            tk(pid, (error) => {
                if (error) return reject(error)
                resolve()
            })
        })
    }  
}

setInterval(async () => {

    const x = await listProcesses()
    const y = matchExecutableNames(config.executables, x)
    await killOff(y.map(x => x[1]))

}, config.intervalSeconds * 1000)