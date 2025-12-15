

export function getArrayData(data: any) {
    if (data) {
        return Object.entries(data).map(([key , value])=>({
          ...value as any, 
          id: key
        }))
    }
}