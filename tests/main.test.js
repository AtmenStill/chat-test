const request = require('supertest')
const app = require('../server')



test('creating the server', async () => {
    const response = await request(app)
    .expect(200)
})


// test('Should create task for user', async () => {
//     const response = await request(app)
//     .post('/tasks')
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .send({
//         description: 'Testing? Testing.'
//     })
//     .expect(201)
//     const task = await Task.findById(response.body._id)
//     expect(task).not.toBeNull()
// })