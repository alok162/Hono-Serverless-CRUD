import { Router } from 'itty-router';
import { Hono } from 'hono';
import { Context } from 'hono';

interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
  }

  const router = new Hono()


	// router.get('/api/v1/users/', (c) => c.text('Please test me!'))


  router.get('/api/v1/users/', async (c : Context) => {
	try{
		const { results } = await c.env.DB.prepare(`SELECT * FROM Users`).all()
	  	return c.json(results)
	} catch (e) {
		return c.json(e)
	}
  })

  router.get('/api/v1/users/:name', async (c : Context) => {
	const id = c.req.param("name");
	try{
		const { results } = await c.env.DB.prepare(`SELECT * FROM Users where name = ?`).bind(id).run()
	  	return c.json(results)
	} catch (e) {
		return c.json(e)
	}
  })

//   export default app

// // // now let's create a router (note the lack of "new")
// const router = Router();

// GET collection index
router.get('/api/v1', () => new Response('Alok-1 : my first POC to cloudflare workers serverless'));

// GET collection index
router.get('/api/v2', () => new Response('Alok-2 : my second api'));



// // GET collection index
// // router.get('/api/v1/users', () => new Response('Alok-2 : my second api'));
// router.get("/api/v1/users/", async (c, env) => {
// 	// const userId= c.req.param("id")
	
// 	console.log("before invoked users api ---", env)
// 	try {
// 	  let { results } = await env.DB.prepare("SELECT * FROM User").all()
// 	  console.log("after invoked users api ---")

// 	  return c.json(results)
// 	} catch (e) {
// 	  return c.json({err: e}, 500)
// 	}
//   })

// // GET item
// router.get('/api/todos/:id', ({ params }) => new Response(`Todo #${params.id}`));

// POST to the collection (we'll use async here)
router.post('/api/v1/users/', async (c: Context) => {
	const content = await c.req.json()
	const { success } = await c.env.DB.prepare(`
    insert into Users (name, address) values (?, ?)
  `).bind(content.name, content.address).run()

  if (success) {
    c.status(201)
    return c.text("Created")
  } else {
    c.status(500)
    return c.text("Something went wrong")
  }
});

router.delete('/api/v1/users/:name',async (c: Context) => {
	try {
		const todoId = c.req.param("name");
		const { success } = await c.env.DB.prepare("DELETE FROM Users where name = ?")
		  .bind(todoId)
		  .run();
	
		if (!success) {
		  return c.json({
			success: true,
			data: {
			  deleted: false,
			},
			message: "Unable to delete. Please try later",
		  });
		}
	
		return c.json({
		  success: true,
		  data: {
			deleted: true,
		  },
		});
	  } catch (error) {
		console.log("error", error);
		return c.json({
		  success: false,
		  data: null,
		  message: "Server Error",
		});
	  }
})

router.put('/api/v1/users/:name',async (c: Context) => {
	const content = await c.req.json()
	const name = c.req.param("name");
	try {
	const { success } = await c.env.DB.prepare(
	"UPDATE Users SET address = ? WHERE name = ?"
	)
	.bind(content.address, name)
	.run();
		return c.json({
		  success: true,
		});
	
	} catch (error) {
		return c.json({
		success: false,
		message: error,
	});
	}
})

// // 404 for everything else
// router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
