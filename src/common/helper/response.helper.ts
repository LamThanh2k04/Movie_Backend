export const successResponse = (data: any, message: string = 'Thành công', status: number = 200) => {
    return {
        status,
        message,
        data
    }
}